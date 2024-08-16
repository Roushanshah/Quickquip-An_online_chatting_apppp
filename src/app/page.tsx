import { db } from "@/lib/db";

export default async function Home() {
  await db.set('db', 'hello')
  return (
    <div className="text-red-500">Hello World</div>
  );
}
