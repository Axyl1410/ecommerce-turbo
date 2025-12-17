import type { WishlistItemRow } from "@workspace/types";

export class WishlistItem {
	public constructor(
		public readonly id: WishlistItemRow["id"],
		public readonly userId: WishlistItemRow["userId"],
		public readonly productId: WishlistItemRow["productId"],
		public readonly createdAt: WishlistItemRow["createdAt"],
	) {}
}