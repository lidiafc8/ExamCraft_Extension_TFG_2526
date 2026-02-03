# PROMPT COMPLETO PARA GENERACIÓN DE ENTIDADES, ATRIBUTOS, RELACIONES (DIAGRAMA UML) Y RESTRICCIONES DE ATRIBUTOS

Una vez que tenemos la extensión funcional completa del nuevo examen, pasaremos a la siguiente tarea que quiero que realices.

Quiero que en base a la lógica de la extensión funcional que me has pasado, me generes un diagrama UML en código **Mermaid** similar al de los ejemplos que te he pasado en el documento `“Enunciados de ejemplo”`.

### Requisitos para el Diagrama UML:

* Recuerda todo el contexto dado en la anterior petición.
* De los enunciados de ejemplo, céntrate en los del proyecto **[ajedrez / clínica veterinaria]**, es decir, del que hemos creado la extensión.
* De ellos, mantendrás la estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad) de las **clases base (negras)**.
* Para las **nuevas clases a implementar por el alumno (rojas)**, añadirás toda su estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), acorde a la extensión funcional generada.
* Para las relaciones, si estas tienen un nombre asignado, este debe constar en el diagrama.
* **Estilos:**
    * El color del contenido de las clases negras debe ser negro.
    * El color del contenido de las clases rojas debe ser rojo.

---

### Requisitos para el Enunciado del Ejercicio 1 (Restricciones):

Una vez creado el diagrama, generarás el enunciado para el **ejercicio 1** del examen, es decir, las restricciones a nivel de entidad de los atributos que componen las clases a implementar por el alumno (clases rojas).

**Recurso:** Te adjunto el PDF llamado `“Ejercicios 1 de ejemplo exámenes anteriores”` como referencia.

**Condiciones:**
* **ÚNICAMENTE** generarás las restricciones a nivel de entidad de los atributos de las clases a implementar por el alumno.
* Las restricciones tendrán que ser parecidas a los ejemplos del PDF.
* Sé lo más creativo posible en cuanto a restricciones, ni muy simples, ni muy complejas.

**Sintaxis obligatoria del enunciado:**

   "Modificar las clases [“clases a implementar nuevas (rojas)”] para que sean entidades. Estas deben tener los siguientes atributos y restricciones:
  
   Para la clase [clase a implementar nueva (roja)]:
   El atributo de tipo [tipo de atributo] llamado [nombre de atributo] actuará como [opcional/obligatorio], [restricciones explicadas en forma de texto]"

**Párrafo final obligatorio:**

Al final del enunciado generado, añadirás este párrafo:

   "No modifique por ahora las anotaciones @Transient de las clases. Modificar las interfaces [repositorios de entidades nuevas a implementar por el alumno (rojas), no siendo enumerados] alojada en el mismo paquete para que extienda a CrudRepository."