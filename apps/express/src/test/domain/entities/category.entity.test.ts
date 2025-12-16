import { Category } from "@/domain/entities/category.entity";
import { DomainError } from "@/shared/errors/domain.error";
import { buildCategory, buildCategoryProps } from "./helpers";

describe("Category Entity", () => {
	const createCategory = (
		overrides?: Partial<ReturnType<typeof buildCategoryProps>>,
	) => {
		const props = buildCategoryProps(overrides);
		return Category.create(
			props.id,
			props.name,
			props.slug,
			props.description,
			props.imageUrl,
			props.parentId,
			props.sortOrder,
			props.active,
			props.createdAt,
			props.updatedAt,
		);
	};

	it("creates a category with a slug value object", () => {
		const category = createCategory({ slug: "awesome-category" });

		expect(category.getSlug()).toBe("awesome-category");
		expect(category.isActive()).toBe(true);
	});

	it("throws when creating category with invalid slug", () => {
		expect(() => createCategory({ slug: "Invalid Slug!" })).toThrow(
			DomainError,
		);
	});

	it("activates a category", () => {
		const category = createCategory({ active: false });

		category.activate();

		expect(category.isActive()).toBe(true);
	});

	it("deactivates a category", () => {
		const category = createCategory({ active: true });

		category.deactivate();

		expect(category.isActive()).toBe(false);
	});

	it("updates slug via value object validation", () => {
		const category = createCategory({ slug: "old-slug" });

		category.updateSlug("new-slug");

		expect(category.getSlug()).toBe("new-slug");
	});

	it("throws when updating to invalid slug", () => {
		const category = createCategory({ slug: "valid-slug" });

		expect(() => category.updateSlug("Invalid Slug!")).toThrow(DomainError);
	});

	it("updates active status", () => {
		const category = createCategory({ active: true });

		category.updateActive(false);

		expect(category.isActive()).toBe(false);
	});

	it("can be parent of another category", () => {
		const category = createCategory({ id: "cat-1" });

		expect(category.canBeParentOf("cat-2")).toBe(true);
	});

	it("cannot be parent of itself", () => {
		const category = createCategory({ id: "cat-1" });

		expect(category.canBeParentOf("cat-1")).toBe(false);
	});

	it("is not a descendant when it has no parent", () => {
		const category = createCategory({ id: "cat-1", parentId: null });
		const allCategories = [category];

		expect(category.isDescendantOf("cat-2", allCategories)).toBe(false);
	});

	it("is a descendant when parentId matches", () => {
		const parent = createCategory({ id: "parent-1" });
		const child = createCategory({
			id: "child-1",
			parentId: "parent-1",
		});
		const allCategories = [parent, child];

		expect(child.isDescendantOf("parent-1", allCategories)).toBe(true);
	});

	it("is a descendant through multiple levels", () => {
		const grandparent = createCategory({ id: "grandparent-1" });
		const parent = createCategory({
			id: "parent-1",
			parentId: "grandparent-1",
		});
		const child = createCategory({
			id: "child-1",
			parentId: "parent-1",
		});
		const allCategories = [grandparent, parent, child];

		expect(child.isDescendantOf("grandparent-1", allCategories)).toBe(true);
		expect(child.isDescendantOf("parent-1", allCategories)).toBe(true);
		expect(parent.isDescendantOf("grandparent-1", allCategories)).toBe(true);
	});

	it("is not a descendant when parent chain does not match", () => {
		const category1 = createCategory({ id: "cat-1" });
		const category2 = createCategory({
			id: "cat-2",
			parentId: "cat-1",
		});
		const category3 = createCategory({ id: "cat-3" });
		const allCategories = [category1, category2, category3];

		expect(category2.isDescendantOf("cat-3", allCategories)).toBe(false);
	});

	it("returns false when parent is not found in allCategories", () => {
		const category = createCategory({
			id: "cat-1",
			parentId: "non-existent",
		});
		const allCategories = [category];

		// Check if cat-1 is descendant of "other-category" (not its parentId)
		// Since parent "non-existent" is not in allCategories, it should return false
		expect(category.isDescendantOf("other-category", allCategories)).toBe(
			false,
		);
	});
});



