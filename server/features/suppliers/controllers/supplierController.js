import prisma from "../../../config/prisma.js";
import { createSupplierSchema, updateSupplierSchema } from "../schema.js";

export async function createSupplier(req, res) {
  const requestData = req.body;
  const accountId = req.user.accountId;

  const validated = createSupplierSchema.safeParse(requestData);

  if (!validated.success) {
    return res.status(400).json({ error: validated.error });
  }

  const { description, address, telephone, email } = validated.data;

  try {
    const created = await prisma.supplier.create({
      data: {
        description,
        address,
        telephone,
        email,
        account: { connect: { id: accountId } },
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create supplier" });
  }
}

export async function getAllSuppliers(req, res) {
  const { description, search } = req.query;
  const accountId = req.user.accountId;

  const whereQuery = { accountId };

  // Build where clause dynamically
  if (description) {
    whereQuery.description = { contains: description, mode: "insensitive" };
  }

  if (search) {
    whereQuery.OR = [
      { description: { contains: search, mode: "insensitive" } },
      // Add other searchable fields here
    ];
  }

  try {
    const suppliers = await prisma.supplier.findMany({
      where: whereQuery,
    });

    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
}

export async function getSupplierbyId(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id, accountId },
    });

    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to find supplier" });
  }
}

export async function updateSupplier(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;
  const requestData = req.body;

  const validated = updateSupplierSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { description, address, telephone, email } = validated.data;

  try {
    const updated = await prisma.supplier.update({
      where: { id, accountId },
      data: {
        description,
        address,
        telephone,
        email,
      },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.status(500).json({ error: "Failed to update supplier" });
  }
}

export async function deleteSupplier(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    await prisma.supplier.delete({
      where: { id, accountId },
    });
    res.status(204).send(); // No body with 204
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.status(500).json({ error: "Failed to delete supplier" });
  }
}
