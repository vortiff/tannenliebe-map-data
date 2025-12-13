export default {
  async fetch(request, env) {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const db = env.DB;

    const result = await db
      .prepare(`SELECT id, name, address, lat, lng, category FROM locations`)
      .all();

    return Response.json(result.results);
  }
};