import { Button } from "@/_components/ui/button";
import { Card, CardContent } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { useAppForm } from "@/_components/ui/tanstack-form";
import { trpc } from "@/lib/trpc-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(50, "Name cannot be longer than 50 characters"),
});

function getInitials(
	name: string | null | undefined,
	email: string | null | undefined,
): string {
	if (name && name.length > 0) {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	}
	if (email && email.length > 0) {
		return email.split("@")[0].slice(0, 2).toUpperCase();
	}
	return "??";
}

export function Profile() {
	const profile = useQuery(trpc.user.getMyProfile.queryOptions());
	const [isEditing, setIsEditing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const updateMutation = useMutation(
		trpc.user.updateProfile.mutationOptions({
			onSuccess: () => {
				profile.refetch();
				setIsEditing(false);
				toast.success("Profile updated successfully");
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update profile");
			},
		}),
	);

	const form = useAppForm({
		defaultValues: {
			name: "",
		},
		validators: {
			onChange: FormSchema,
		},
		onSubmit: async ({ value }) => {
			updateMutation.mutate({
				name: value.name.trim(),
				image: profile.data?.image || undefined,
			});
		},
	});

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			e.stopPropagation();
			void form.handleSubmit();
		},
		[form],
	);

	useEffect(() => {
		if (profile.data) {
			form.setFieldValue("name", profile.data.name || "New User");
		}
	}, [profile.data, form.setFieldValue]);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Create an image element to check dimensions
		const img = new Image();
		img.src = URL.createObjectURL(file);
		img.onload = () => {
			if (img.width > 512 || img.height > 512) {
				toast.error("Image must be 512x512 pixels or smaller");
				return;
			}

			const reader = new FileReader();
			reader.onload = async (e) => {
				const base64Image = e.target?.result as string;
				if (!profile.data) return;

				updateMutation.mutate({
					name: profile.data.name || "New User",
					image: base64Image,
				});
			};
			reader.readAsDataURL(file);
		};
	};

	return (
		<div className="container mx-auto w-full min-w-0 max-w-[90vw] px-3 py-2 sm:max-w-2xl sm:px-4 md:max-w-3xl">
			<div className="mx-auto w-full max-w-xl space-y-8">
				<div className="space-y-4">
					<h2 className="text-center font-bold text-2xl">My Profile</h2>

					<Card className="overflow-hidden p-2">
						{profile.isLoading ? (
							<CardContent className="flex items-center justify-center py-4">
								<div className="text-center text-muted-foreground">
									<Loader2 className="mx-auto mb-1 animate-spin" />
									Loading profile...
								</div>
							</CardContent>
						) : !profile.data ? (
							<CardContent className="py-3">
								<div className="text-center text-muted-foreground">
									Profile not available
								</div>
							</CardContent>
						) : (
							<CardContent className="px-4 py-3">
								<div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-4">
									<div className="group relative">
										<div
											className={`relative h-20 w-20 overflow-hidden rounded-full bg-muted ${isEditing ? "ring-2 ring-primary ring-offset-2" : ""}`}
										>
											{profile.data.image ? (
												<img
													src={profile.data.image}
													alt={profile.data.name}
													className="h-full w-full rounded-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center rounded-full bg-primary font-bold text-3xl text-primary-foreground">
													{getInitials(profile.data.name, profile.data.email)}
												</div>
											)}
											<Button
												variant="ghost"
												size="icon"
												className={`absolute inset-0 flex h-full w-full items-center justify-center bg-black/50 transition-opacity ${isEditing ? "opacity-100 hover:opacity-80" : "opacity-0 group-hover:opacity-100"}`}
												onClick={() => fileInputRef.current?.click()}
											>
												{isEditing ? (
													<Camera className="h-5 w-5 text-white" />
												) : (
													<span className="text-sm text-white">Change</span>
												)}
											</Button>
										</div>
										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											className="hidden"
											onChange={handleFileChange}
										/>
									</div>
									<div className="w-full flex-1 text-center sm:text-left">
										{isEditing ? (
											<form.AppForm>
												<form className="space-y-3" onSubmit={handleSubmit}>
													<form.AppField name="name">
														{(field) => (
															<field.FormItem>
																<field.FormLabel>Display Name</field.FormLabel>
																<field.FormControl>
																	<div className="relative">
																		<Input
																			value={field.state.value}
																			onChange={(e) =>
																				field.handleChange(e.target.value)
																			}
																			onBlur={field.handleBlur}
																			className="text-lg"
																			maxLength={20}
																			disabled={updateMutation.isPending}
																		/>
																		<span className="-translate-y-1/2 absolute top-1/2 right-2 text-muted-foreground text-sm">
																			{field.state.value.length}/20
																		</span>
																	</div>
																</field.FormControl>
																<field.FormMessage />
															</field.FormItem>
														)}
													</form.AppField>
													<div className="flex space-x-2">
														<form.Subscribe>
															{(state) => (
																<Button
																	type="submit"
																	disabled={
																		!state.canSubmit ||
																		state.isSubmitting ||
																		updateMutation.isPending
																	}
																>
																	{updateMutation.isPending
																		? "Saving..."
																		: "Save"}
																</Button>
															)}
														</form.Subscribe>
														<Button
															variant="outline"
															onClick={() => {
																setIsEditing(false);
																if (profile.data) {
																	form.setFieldValue(
																		"name",
																		profile.data.name || "New User",
																	);
																}
															}}
														>
															Cancel
														</Button>
													</div>
												</form>
											</form.AppForm>
										) : (
											<div className="space-y-0.5">
												<div className="flex items-start justify-between">
													<h3 className="font-semibold text-2xl">
														{profile.data.name || "New User"}
													</h3>
													<Button
														variant="outline"
														size="sm"
														onClick={() => setIsEditing(true)}
													>
														Edit
													</Button>
												</div>
												<p className="text-muted-foreground">
													{profile.data.email}
												</p>
												<p className="text-muted-foreground/50 text-sm italic">
													Member since{" "}
													{new Date(
														profile.data.createdAt,
													).toLocaleDateString()}
												</p>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
}
