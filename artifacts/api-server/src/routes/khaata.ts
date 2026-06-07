import { Router } from "express";
import { db, khaataClientsTable, khaataTransactionsTable } from "@workspace/db";
import { eq, desc, sum } from "drizzle-orm";

const router = Router();

// GET /khaata/clients
router.get("/khaata/clients", async (req, res) => {
  try {
    const clients = await db
      .select()
      .from(khaataClientsTable)
      .orderBy(desc(khaataClientsTable.createdAt));

    const balances = await db
      .select({
        clientId: khaataTransactionsTable.clientId,
        type: khaataTransactionsTable.type,
        total: sum(khaataTransactionsTable.amount),
      })
      .from(khaataTransactionsTable)
      .groupBy(khaataTransactionsTable.clientId, khaataTransactionsTable.type);

    const balMap: Record<number, { debit: number; credit: number }> = {};
    for (const b of balances) {
      if (!balMap[b.clientId]) balMap[b.clientId] = { debit: 0, credit: 0 };
      if (b.type === "debit") balMap[b.clientId].debit = Number(b.total) || 0;
      if (b.type === "credit") balMap[b.clientId].credit = Number(b.total) || 0;
    }

    const result = clients.map((c) => {
      const bal = balMap[c.id] ?? { debit: 0, credit: 0 };
      return {
        ...c,
        createdAt: c.createdAt.toISOString(),
        totalDebit: bal.debit,
        totalCredit: bal.credit,
        balance: bal.debit - bal.credit,
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list khaata clients");
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// POST /khaata/clients
router.post("/khaata/clients", async (req, res) => {
  const { name, phone, note } = req.body as { name?: string; phone?: string; note?: string };
  if (!name?.trim() || !phone?.trim()) {
    res.status(400).json({ error: "Name and phone are required" });
    return;
  }
  try {
    const [client] = await db
      .insert(khaataClientsTable)
      .values({ name: name.trim(), phone: phone.trim(), note: note?.trim() || null })
      .returning();
    res.status(201).json({ ...client, createdAt: client.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create khaata client");
    res.status(500).json({ error: "Failed to create client" });
  }
});

// DELETE /khaata/clients/:id
router.delete("/khaata/clients/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(khaataClientsTable).where(eq(khaataClientsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete khaata client");
    res.status(500).json({ error: "Failed to delete client" });
  }
});

// GET /khaata/clients/:id/transactions
router.get("/khaata/clients/:id/transactions", async (req, res) => {
  const clientId = Number(req.params.id);
  try {
    const txns = await db
      .select()
      .from(khaataTransactionsTable)
      .where(eq(khaataTransactionsTable.clientId, clientId))
      .orderBy(desc(khaataTransactionsTable.date));
    res.json(
      txns.map((t) => ({
        ...t,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to fetch khaata transactions");
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// POST /khaata/clients/:id/transactions
router.post("/khaata/clients/:id/transactions", async (req, res) => {
  const clientId = Number(req.params.id);
  const { amount, type, description, date } = req.body as {
    amount?: number; type?: string; description?: string; date?: string;
  };
  if (!amount || !["debit", "credit"].includes(type ?? "")) {
    res.status(400).json({ error: "amount and type (debit/credit) are required" });
    return;
  }
  try {
    const [txn] = await db
      .insert(khaataTransactionsTable)
      .values({
        clientId,
        amount: Math.abs(Number(amount)),
        type: type!,
        description: description?.trim() || null,
        date: date ? new Date(date) : new Date(),
      })
      .returning();
    res.status(201).json({ ...txn, date: txn.date.toISOString(), createdAt: txn.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to add khaata transaction");
    res.status(500).json({ error: "Failed to add transaction" });
  }
});

// DELETE /khaata/transactions/:id
router.delete("/khaata/transactions/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(khaataTransactionsTable).where(eq(khaataTransactionsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete khaata transaction");
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;
