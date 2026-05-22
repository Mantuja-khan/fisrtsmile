import axios from "axios";

async function inspect() {
  try {
    const catRes = await axios.get("https://api.toyhaat.com/api/categories");
    const categories = catRes.data.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      parent_id: c.parent?._id || c.parent || null,
    }));

    const parentCategories = categories.filter((c) => !c.parent_id);
    const subcategories = categories.filter((c) => c.parent_id);

    console.log(`\nTotal Parent Categories: ${parentCategories.length}`);
    parentCategories.forEach((p) => {
      const children = categories.filter((c) => c.parent_id === p.id);
      console.log(
        `Parent: "${p.name}" (ID: ${p.id}, Slug: ${p.slug}) -> Children count: ${children.length}`,
      );
      children.forEach((ch) => {
        console.log(
          `  - Child: "${ch.name}" (ID: ${ch.id}, Slug: ${ch.slug}, Parent ID: ${ch.parent_id})`,
        );
      });
    });

    console.log(`\nSubcategories count: ${subcategories.length}`);
    const orphanedSubs = subcategories.filter(
      (s) => !parentCategories.some((p) => p.id === s.parent_id),
    );
    console.log(
      `Orphaned subcategories (whose parent_id is not in parent list): ${orphanedSubs.length}`,
    );
    orphanedSubs.forEach((o) => {
      console.log(`  - Name: "${o.name}" (ID: ${o.id}, Parent ID: ${o.parent_id})`);
    });
  } catch (err) {
    console.error("Error inspecting database:", err.message);
  }
}

inspect();
