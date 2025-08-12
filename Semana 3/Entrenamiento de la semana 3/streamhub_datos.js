

// 📦 Inserciones
use Streamhub

db.usuarios.insertOne({
  nombre: "Daniel Torres",
  correo: "daniel@example.com",
  pais: "Colombia",
  generos_favoritos: ["acción", "ciencia ficción", "comedia"],
  historial: [],
  listas: []
})

db.usuarios.insertMany([
  {
    nombre: "Ana Ruiz",
    correo: "ana@example.com",
    pais: "Argentina",
    generos_favoritos: ["comedia", "aventura"],
    historial: [],
    listas: []
  },
  {
    nombre: "Pedro Hongui",
    correo: "pedro@example.com",
    pais: "Chile",
    generos_favoritos: ["comedia", "aventura"],
    historial: [],
    listas: []
  }
])

db.usuarios.insertOne({
  nombre: "Laura Gomez",
  correo: "laura@example.com",
  pais: "Mexico",
  generos_favoritos: ["drama", "romance", "suspenso"],
  historial: [],
  listas: [
    {
      nombre: "Favoritas 2025",
      contenidos: []
    }
  ]
})

db.contenidos.insertMany([
  {
    titulo: "Invasión Galáctica",
    genero: "ciencia ficción",
    año: 2022,
    director: "Carlos Méndez",
    calificacion: 4.5
  },
  {
    titulo: "Amor en Tiempos Modernos",
    genero: "romance",
    año: 2023,
    director: "Laura Martínez",
    calificacion: 4.2
  },
  {
    titulo: "Risa Extrema",
    genero: "comedia",
    año: 2021,
    director: "José Pérez",
    calificacion: 4.0
  }
])

// 🔍 Consultas con find()
db.usuarios.find()
db.usuarios.find({ pais: "Colombia" })

// ✏️ updateOne
db.usuarios.updateOne(
  { correo: "daniel@example.com" },
  { $set: { pais: "México" } }
)

// Agregar contenido a una lista
db.usuarios.updateOne(
  {
    correo: "laura@example.com",
    "listas.nombre": "Favoritas 2025"
  },
  {
    $push: {
      "listas.$.contenidos": ObjectId("ID_DEL_CONTENIDO")
    }
  }
)

// ❌ deleteOne
db.usuarios.deleteOne({ correo: "pedro@example.com" })

// 🧭 Crear índice
db.usuarios.createIndex({ correo: 1 }, { unique: true })

// 🧩 Aggregation 1: Historial completo del usuario
db.usuarios.aggregate([
  { $match: { correo: "daniel@example.com" } },
  {
    $lookup: {
      from: "contenidos",
      localField: "historial",
      foreignField: "_id",
      as: "historial_completo"
    }
  },
  {
    $project: {
      nombre: 1,
      correo: 1,
      historial_completo: 1
    }
  }
])

// 🧩 Aggregation 2: Conteo de usuarios por país
db.usuarios.aggregate([
  {
    $group: {
      _id: "$pais",
      total_usuarios: { $sum: 1 }
    }
  },
  {
    $sort: { total_usuarios: -1 }
  }
])
