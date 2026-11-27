import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad | Concrecol',
  description: 'Conoce cómo Concrecol trata tus datos personales y cómo ejercer tus derechos.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 border-b-4 border-[#C4D600] pb-6">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Política de privacidad y tratamiento de datos personales
        </h1>
        <p className="mt-4 text-gray-600">
          Conoce qué datos usamos al atender tus solicitudes, preparar cotizaciones y gestionar pedidos,
          y cómo puedes ejercer tus derechos.
        </p>
      </header>

      <div className="space-y-8 text-base leading-relaxed text-gray-700 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_p+p]:mt-3">
        <section>
          <h2>Responsable del tratamiento</h2>
          <p>
            Ingeniería en Concreto Concrecol Obras de Infraestructura S.A.S. (Concrecol), NIT 901846225,
            con domicilio en Pinchote, Santander, Colombia. Dirección de atención en el km 8 de la vía San Gil–Socorro.
            La Gerencia atiende las consultas y reclamos sobre datos personales en{' '}
            <a className="font-medium underline" href="mailto:gerencia@concrecol.co">gerencia@concrecol.co</a>.
            Teléfono de contacto{' '}
            <a className="font-medium underline" href="tel:+573214525798">+57 321 452 5798</a>.
          </p>
          <p>
            Esta política se aplica conforme a la Ley 1581 de 2012 y al Decreto 1074 de 2015.
          </p>
        </section>

        <section>
          <h2>Datos que tratamos y para qué los usamos</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Contacto y cotizaciones.</strong> Usamos tu nombre, teléfono, correo, mensaje y los datos que
              compartas sobre la obra, como su ubicación, el tipo y volumen de concreto y la fecha requerida,
              para responderte, revisar la cobertura y preparar y dar seguimiento a la cotización.
            </li>
            <li>
              <strong>Pedidos, entregas y posventa.</strong> Usamos tus datos de contacto, identificación,
              facturación, dirección de entrega e información de la compra para confirmar el pedido, coordinar
              el despacho, procesar y conciliar el pago, emitir la factura, atender novedades y cumplir obligaciones
              contables, tributarias y contractuales.
            </li>
            <li>
              <strong>Operación y seguridad del sitio.</strong> Podemos usar datos técnicos de conexión y
              preferencias del navegador para mantener el funcionamiento del sitio, protegerlo frente a usos
              indebidos y recordar tu selección de cookies.
            </li>
          </ul>
        </section>

        <section>
          <h2>Autorización y datos sensibles</h2>
          <p>
            Cuando la ley lo exige, solicitamos autorización previa e informada y conservamos prueba de ella.
            Si cambia la finalidad del tratamiento, solicitaremos una nueva autorización cuando corresponda.
            Los formularios del sitio están dirigidos a personas adultas y no solicitan datos sensibles.
            Es facultativo responder preguntas sobre datos sensibles o de niñas, niños y adolescentes.
            Si excepcionalmente se requiere tratar estos datos, se aplicarán las condiciones y protecciones legales.
          </p>
        </section>

        <section>
          <h2>Proveedores, conservación y seguridad</h2>
          <p>
            Podemos compartir los datos necesarios con quienes nos prestan servicios de alojamiento, correo,
            logística, pagos o facturación, y con autoridades cuando exista una obligación legal o una orden
            competente. Si eliges pagar con tarjeta, Stripe procesa los datos que ingreses en su plataforma.
            Si contactas a Concrecol por WhatsApp, también se aplican las condiciones de privacidad de ese servicio.
            Cuando el tratamiento implique una transmisión o transferencia internacional, se aplicarán los
            requisitos previstos por la normativa colombiana.
          </p>
          <p>
            Concrecol aplica medidas de seguridad y restringe el acceso a los datos según las funciones de
            quienes los necesitan. Las bases de datos se mantienen mientras subsistan las finalidades del
            tratamiento o los deberes legales o contractuales de conservación. Al terminar ese plazo,
            los datos se suprimen o se anonimizan, según corresponda.
          </p>
        </section>

        <section>
          <h2>Cookies y preferencias</h2>
          <p>
            El sitio usa una cookie para guardar tu selección de preferencias hasta por un año.
            El aviso te permite elegir entre aceptar todas las categorías o permitir solo las necesarias.
            Puedes borrar la cookie desde la configuración del navegador para volver a elegir.
            Las funciones de terceros, como la pasarela de pago, pueden usar sus propias cookies.
          </p>
        </section>

        <section>
          <h2>Tus derechos</h2>
          <p>
            Puedes acceder gratuitamente a tus datos, conocerlos, actualizarlos y rectificarlos,
            solicitar prueba de la autorización cuando sea exigible, preguntar cómo se han usado y
            solicitar su supresión o revocar la autorización cuando proceda. La supresión o
            revocatoria está sujeta a los deberes legales o contractuales de conservación.
            También puedes presentar una queja ante la Superintendencia de Industria y Comercio
            una vez agotado el trámite de consulta o reclamo.
          </p>
        </section>

        <section>
          <h2>Cómo presentar una consulta o un reclamo</h2>
          <p>
            Escribe a{' '}
            <a className="font-medium underline" href="mailto:gerencia@concrecol.co">gerencia@concrecol.co</a>
            {' '}o radica tu solicitud por escrito en la dirección de atención indicada. Identifica al titular,
            indica cómo podemos responderle y describe lo que solicitas. Para un reclamo, incluye los hechos y
            los documentos que quieras aportar. Si actúas por otra persona, acredita tu representación.
            Concrecol podrá verificar tu identidad antes de entregar información.
          </p>
          <p>
            <strong>Consultas.</strong> Se responden en un máximo de 10 días hábiles desde su recepción.
            Si se requiere más tiempo, se informará el motivo y la fecha de respuesta, que no excederá
            los 5 días hábiles adicionales.
          </p>
          <p>
            <strong>Reclamos.</strong> Se responden en un máximo de 15 días hábiles desde el día siguiente
            a su recepción. Si se requiere más tiempo, se informará el motivo y la fecha de respuesta,
            que no excederá los 8 días hábiles adicionales. Si el reclamo está incompleto, se pedirá
            completarlo dentro de los 5 días siguientes a su recepción. Si transcurren 2 meses desde
            ese requerimiento sin respuesta, se entenderá desistido.
          </p>
        </section>

        <section>
          <h2>Vigencia y actualizaciones</h2>
          <p>
            Versión 1.0. Esta política rige desde su primera publicación en concrecol.co.
            Los cambios sustanciales se comunicarán a los titulares antes de su aplicación.
          </p>
        </section>
      </div>
    </main>
  )
}
