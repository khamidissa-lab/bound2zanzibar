import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import { EditorHeader } from "@/components/admin/editor-header";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import { listCategories } from "@/services/admin-content";

import { CategoryForm } from "./category-form";

export const metadata: Metadata = { title: "Tour categories" };

export default async function CategoriesPage() {
  const { staff, allowed } = await requireStaffPage(
    "content.manage",
    "/admin/tours/categories",
  );
  if (!allowed) return <AccessDenied />;
  const categories = await listCategories();
  const canDelete = can(staff.role, "content.delete");

  return (
    <div className="max-w-3xl">
      <EditorHeader
        backHref="/admin/tours"
        backLabel="All tours"
        title="Tour categories"
      />
      <p className="-mt-4 mb-6 text-muted-foreground">
        Categories group tours on the website and power the tour filters. Inactive
        categories are hidden from visitors.
      </p>
      <ul className="space-y-4">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryForm category={category} canDelete={canDelete} />
          </li>
        ))}
      </ul>
      <h2 className="mt-10 mb-3 font-display text-xl">Add a category</h2>
      <CategoryForm category={null} canDelete={false} />
    </div>
  );
}
