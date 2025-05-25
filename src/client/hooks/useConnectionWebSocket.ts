import {
	type ConnectionCountMessage,
	connectionCounterAPI,
} from "@client/lib/api/connectionCounter";
import { useCallback, useEffect, useRef, useState } from "react";

// Incoming WebSocket message type
type IncomingWebSocketMessage = ConnectionCountMessage;

// Hook options
export interface UseConnectionWebSocketOptions {
	onConnectionCountUpdate?: (count: number) => void;
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
}

// Hook return type
export interface UseConnectionWebSocketReturn {
	isConnected: boolean;
	connectionState: "connecting" | "connected" | "disconnected" | "error";
	lastError: string | null;
	reconnectCount: number;
	connectionCount: number;
	connect: () => void;
	disconnect: () => void;
}

// Track active connections across hook instances
let activeConnections = 0;

export function useConnectionWebSocket({
	onConnectionCountUpdate,
	reconnectInterval = 5000,
	maxReconnectAttempts = 3,
}: UseConnectionWebSocketOptions = {}): UseConnectionWebSocketReturn {
	const [connectionState, setConnectionState] =
		useState<UseConnectionWebSocketReturn["connectionState"]>("disconnected");
	const [lastError, setLastError] = useState<string | null>(null);
	const [reconnectCount, setReconnectCount] = useState(0);
	const [connectionCount, setConnectionCount] = useState(0);

	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const isManuallyDisconnected = useRef(false);
	const callbackRef = useRef(onConnectionCountUpdate);

	// Keep callback ref updated
	callbackRef.current = onConnectionCountUpdate;

	const clearTimers = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}
		if (pingIntervalRef.current) {
			clearInterval(pingIntervalRef.current);
			pingIntervalRef.current = null;
		}
	}, []);

	const startPing = useCallback(() => {
		// Ping before Cloudflare hibernation timeout
		pingIntervalRef.current = setInterval(() => {
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.send("ping");
			}
		}, 50000);
	}, []);

	const establishWebSocket = useCallback(() => {
		// Already open?
		if (wsRef.current?.readyState === WebSocket.OPEN) return;

		clearTimers();
		isManuallyDisconnected.current = false;
		setConnectionState("connecting");
		setLastError(null);

		try {
			const ws = connectionCounterAPI.createWebSocket();
			wsRef.current = ws;

			ws.onopen = () => {
				activeConnections++;
				setConnectionState("connected");
				setReconnectCount(0);
				setLastError(null);
				startPing();

				// Subscribe for initial count
				const msg = JSON.stringify({
					type: "subscribe",
					timestamp: Date.now(),
				});
				ws.send(msg);
			};

			ws.onmessage = (event) => {
				if (event.data === "pong") return;

				try {
					const parsed = JSON.parse(event.data) as IncomingWebSocketMessage;
					if (parsed.type === "connection-count") {
						setConnectionCount(parsed.count);
						if (callbackRef.current) callbackRef.current(parsed.count);
					}
				} catch (e) {
					console.error("Failed to parse connection-count message:", e);
				}
			};

			ws.onclose = () => {
				clearTimers();
				activeConnections--;
				if (!isManuallyDisconnected.current) {
					setConnectionState("disconnected");
					setReconnectCount((prev) => {
						if (prev < maxReconnectAttempts) {
							reconnectTimeoutRef.current = setTimeout(
								() => establishWebSocket(),
								reconnectInterval,
							);
							return prev + 1;
						}
						return prev;
					});
				}
			};

			ws.onerror = (error) => {
				console.error("WebSocket error (ConnectionCounter):", error);
				setConnectionState("error");
				setLastError("Connection error");
				clearTimers();
			};
		} catch (e) {
			console.error("Failed to create WebSocket (ConnectionCounter):", e);
			setConnectionState("error");
			setLastError("Failed to connect");
		}
	}, [clearTimers, maxReconnectAttempts, reconnectInterval, startPing]);

	// Public connect/disconnect
	const connect = useCallback(() => {
		setReconnectCount(0);
		establishWebSocket();
	}, [establishWebSocket]);
	const disconnect = useCallback(() => {
		isManuallyDisconnected.current = true;
		clearTimers();
		if (wsRef.current) {
			// Send explicit unsubscribe to wake DO and broadcast updated count
			if (wsRef.current.readyState === WebSocket.OPEN) {
				wsRef.current.send(
					JSON.stringify({ type: "unsubscribe", timestamp: Date.now() }),
				);
			}
			wsRef.current.close();
			wsRef.current = null;
		}
		setConnectionState("disconnected");
		setReconnectCount(0);
		setConnectionCount((prev) => Math.max(prev - 1, 0));
	}, [clearTimers]);

	// Clean up on unmount
	useEffect(
		() => () => {
			disconnect();
		},
		[disconnect],
	);

	return {
		isConnected: connectionState === "connected",
		connectionState,
		lastError,
		reconnectCount,
		connectionCount,
		connect,
		disconnect,
	};
}
