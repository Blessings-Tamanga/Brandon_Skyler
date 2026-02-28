import { readData, writeData } from '../../lib/db';

export default async function handler(req, res) {
  const { resource } = req.query;
  const data = await readData();
  if (!data[resource]) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  const items = data[resource];

  switch (req.method) {
    case 'GET':
      res.status(200).json(items);
      break;
    case 'POST':
      // create new item
      const newItem = req.body;
      items.push(newItem);
      await writeData(data);
      res.status(201).json(newItem);
      break;
    case 'PUT':
      // full replace or bulk write
      if (Array.isArray(req.body)) {
        data[resource] = req.body;
      } else {
        const { id, ...rest } = req.body;
        data[resource] = items.map(i => (i.id === id ? { id, ...rest } : i));
      }
      await writeData(data);
      res.status(200).json(data[resource]);
      break;
    case 'DELETE':
      const { id } = req.query;
      data[resource] = items.filter(i => i.id !== parseInt(id, 10));
      await writeData(data);
      res.status(200).json({ ok: true });
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
