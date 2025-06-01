import { cn } from "@client/lib/utils";
import { X } from "lucide-react";
import type React from "react";

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
}

interface DialogContentProps {
	className?: string;
	children: React.ReactNode;
}

interface DialogHeaderProps {
	className?: string;
	children: React.ReactNode;
}

interface DialogTitleProps {
	className?: string;
	children: React.ReactNode;
}

interface DialogDescriptionProps {
	className?: string;
	children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
	if (!open) return null;

	const handleBackdropClick = () => onOpenChange(false);
	const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") onOpenChange(false);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				onClick={handleBackdropClick}
				onKeyDown={handleBackdropKeyDown}
				role="button"
				tabIndex={0}
			/>
			<div className="relative z-50">{children}</div>
		</div>
	);
}

export function DialogContent({ className, children }: DialogContentProps) {
	return (
		<div
			className={cn(
				"mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-lg",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function DialogHeader({ className, children }: DialogHeaderProps) {
	return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({ className, children }: DialogTitleProps) {
	return (
		<h2 className={cn("font-semibold text-gray-900 text-lg", className)}>
			{children}
		</h2>
	);
}

export function DialogDescription({
	className,
	children,
}: DialogDescriptionProps) {
	return (
		<p className={cn("mt-1 text-gray-600 text-sm", className)}>{children}</p>
	);
}

export function DialogClose({ onClose }: { onClose: () => void }) {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClose();
		}
	};

	return (
		<button
			type="button"
			onClick={onClose}
			onKeyDown={handleKeyDown}
			className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
		>
			<X className="h-4 w-4" />
		</button>
	);
}
