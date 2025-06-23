# CLIENT-EVENTS-POC

## Proyecto

**Tecnología:** NestJS (Node.js + TypeScript)

**Instalación y arranque:**

```bash
git clone <repo-url> client-events-poc
cd client-events-poc
npm install
npm run start:dev
```

**Endpoints:**

* `GET /benefits/process`
  [http://localhost:3000/benefits/process](http://localhost:3000/benefits/process)

  * Ejecuta el cálculo de beneficios y escribe el archivo `src/assets/benefits.json`.

* `GET /history/:clientId`
  e.g. [http://localhost:3000/history/client\_7](http://localhost:3000/history/client_7)

  * Devuelve la información histórica por REST sin guardar ningún archivo.

---

## 🧠 Parte 1.1

**¿Cómo manejar tantos datos y procesarlos sin bloquear la API?**

* **Colas de procesamiento**
  Utilizar Queue para encolar la ejecución de `processBenefits()`.

  * La API responde inmediatamente.
  * La cola procesa en background y reintenta automáticamente en caso de fallo.

* **Base de datos relacional**
  Migrar los eventos a una tabla con índices compuestos `(client_id, store_id, timestamp)`.

  * Guardar en otra tabla la “última fecha procesada” por cliente/tienda para procesar solo eventos nuevos.
  * Evita releer y reprocesar todo el histórico en cada ejecución.

* **Cache de rachas**
  Almacenar en caché el contador de visitas consecutivas por `client::store`.

  * Al reiniciar el job, recuperas la última racha sin tener que leer todo el historial.
  * Acelera el cálculo de nuevos beneficios.

* **Pruebas unitarias**
  Cubrir todos los casos:

  1. Exactamente 5 visitas → 1 beneficio.
  2. 6 visitas seguidas → sigue siendo 1 beneficio (no lo incremente).
  3. Recarga en medio → rompe la racha.
  4. Rachas múltiples → detecta beneficios adicionales.
  5. Sin racha → devuelve array vacío.

---

## ✍️ Parte 2

### Limitaciones de la solución actual

1. **Carga completa en memoria**

   * `fs.readFileSync` lee todo el JSON de eventos; dependiente de RAM y CPU.
2. **Reprocesamiento total**

   * Cada ejecución itera **todo** el archivo, sin aprovechar lo ya procesado.
3. **Lectura/Escritura de ficheros**

   * Bloquean la ejecución. Durante lectura/escritura no se atienden otras peticiones.

### ¿Qué pasaría con 100 000 eventos diarios?

* El archivo crecería a millones de registros en pocas semanas, volviendo la lectura y el parseo cada vez más lentos (segundos o minutos).
* Las peticiones bloquearían o harían timeout mientras dure la lectura/escritura.
* El uso de memoria explotaría y la CPU se saturaría al ordenar y filtrar millones de objetos.
* El coste en producción se dispararía, requiriendo instancias con mucha RAM y CPU solo para procesar el JSON.
