const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://danieloso777:DFQF@cluster0.z9dmaug.mongodb.net/infraestructura?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Conectado correctamente a MongoDB Atlas");

    const db = client.db();
    const logs = db.collection("logs");

    const resultado = await logs.insertOne({
      usuario_id: 123,
      accion: "inició sesión",
      fecha: new Date(),
    });

    console.log("📝 Documento insertado:", resultado.insertedId);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

run();
