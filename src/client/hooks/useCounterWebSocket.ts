import {
	type CounterState,
	type CounterWebSocketMessage,
	counterAPI,
} from "@client/lib/api/counter";
import { useCallback, useEffect, useRef, useState } from "react";

// Include connection-count message type in incoming WebSocket messages
interface ConnectionCountMessage {
	type: "connection-count";
	count: number;
	timestamp: number;
}

type IncomingWebSocketMessage =
	| CounterWebSocketMessage
	| ConnectionCountMessage;

// Track number of active WebSocket connections
let activeWebSocketConnections = 0;

export interface UseCounterWebSocketOptions {
	onCounterUpdate?: (state: CounterState) => void;
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
}

export interface UseCounterWebSocketReturn {
	isConnected: boolean;
	connectionState: "connecting" | "connected" | "disconnected" | "error";
	lastError: string | null;
	reconnectCount: number;
	connectionCount: number;
	connect: () => void;
	disconnect: () => void;
}

export function useCounterWebSocket({
	onCounterUpdate,
	reconnectInterval = 5000,
	maxReconnectAttempts = 3,
}: UseCounterWebSocketOptions = {}): UseCounterWebSocketReturn {
	const [connectionState, setConnectionState] = useState<
		"connecting" | "connected" | "disconnected" | "error"
	>("disconnected");
	const [lastError, setLastError] = useState<string | null>(null);
	const [reconnectCount, setReconnectCount] = useState(0);
	const [connectionCount, setConnectionCount] = useState<number>(0);

	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const isManuallyDisconnected = useRef(false);
	const callbackRef = useRef(onCounterUpdate);

	// Update callback ref when it changes
	callbackRef.current = onCounterUpdate;

	const clearTimeouts = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}
		if (pingIntervalRef.current) {
			clearInterval(pingIntervalRef.current);
			pingIntervalRef.current = null;
		}
	}, []);

	const startPingInterval = useCallback(() => {
		// Send ping every 50 seconds to keep hibernated connection alive
		// Cloudflare has a 60 second timeout, so we ping before that
		pingIntervalRef.current = setInterval(() => {
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.send("ping");
			}
		}, 50000);
	}, []);

	const connectWebSocket = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			return;
		}

		clearTimeouts();
		isManuallyDisconnected.current = false;
		setConnectionState("connecting");
		setLastError(null);

		try {
			const ws = counterAPI.createWebSocket();
			wsRef.current = ws;

			ws.onopen = () => {
				console.log("WebSocket connected successfully");
				activeWebSocketConnections++;
				console.log(
					`[WebSocket] Active connections: ${activeWebSocketConnections}`,
				);
				setConnectionState("connected");
				setReconnectCount(0);
				setLastError(null);
				startPingInterval();

				// Subscribe to counter updates
				const subscribeMessage = JSON.stringify({
					type: "subscribe",
					timestamp: Date.now(),
				});
				console.log("Sending subscribe message:", subscribeMessage);
				ws.send(subscribeMessage);
			};

			ws.onmessage = (event) => {
				console.log("Received WebSocket message:", event.data);

				// Handle pong response from auto-response
				if (event.data === "pong") {
					console.log("Received pong response");
					return;
				}

				try {
					// Parse incoming message
					const parsed = JSON.parse(event.data) as IncomingWebSocketMessage;
					console.log("Parsed WebSocket message:", parsed);

					// Handle connection count updates
					if (parsed.type === "connection-count") {
						console.log(`[WebSocket] Active connections: ${parsed.count}`);
						setConnectionCount(parsed.count);
						return;
					}

					// Handle counter update or initial state messages
					if (
						parsed.type === "counter-update" ||
						parsed.type === "counter-state"
					) {
						if (parsed.data && callbackRef.current) {
							callbackRef.current(parsed.data);
						}
					}
				} catch (error) {
					console.error("Failed to parse WebSocket message:", error);
				}
			};

			ws.onclose = (event) => {
				console.log(
					`WebSocket closed: code=${event.code}, reason="${event.reason}", wasClean=${event.wasClean}`,
				);
				clearTimeouts();
				activeWebSocketConnections--;
				console.log(
					`[WebSocket] Active connections: ${activeWebSocketConnections}`,
				);

				if (!isManuallyDisconnected.current) {
					setConnectionState("disconnected");

					// Only attempt reconnect if under the max attempts
					setReconnectCount((prevCount) => {
						if (prevCount < maxReconnectAttempts) {
							console.log(
								`Scheduling reconnect attempt ${prevCount + 1}/${maxReconnectAttempts} in ${reconnectInterval}ms`,
							);
							reconnectTimeoutRef.current = setTimeout(() => {
								connectWebSocket();
							}, reconnectInterval);
							return prevCount + 1;
						}
						console.log("Max reconnect attempts reached");
						return prevCount;
					});
				}
			};

			ws.onerror = (error) => {
				console.error("WebSocket error:", error);
				setConnectionState("error");
				setLastError("Connection error occurred");
				clearTimeouts();
			};
		} catch (error) {
			console.error("Failed to create WebSocket:", error);
			setConnectionState("error");
			setLastError("Failed to create WebSocket connection");
		}
	}, [
		clearTimeouts,
		startPingInterval,
		reconnectInterval,
		maxReconnectAttempts,
	]);

	// Create stable connect function
	const connect = useCallback(() => {
		setReconnectCount(0);
		connectWebSocket();
	}, [connectWebSocket]);

	const disconnect = useCallback(() => {
		isManuallyDisconnected.current = true;
		clearTimeouts();

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setConnectionState("disconnected");
		setReconnectCount(0);
		setConnectionCount((prev) => Math.max(prev - 1, 0));
	}, [clearTimeouts]);

	useEffect(() => {
		return () => {
			disconnect();
		};
	}, [disconnect]);

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
