# Biblioteca de Prompts — ExamCraft

![Logo ExamCraft](../exam-craft-extension-frontend/assets/icon512.png)

<br>
<br>

# CONTROL DE VERSIONES

| Versión | Fecha | Autor(es) | Descripción de Cambios |
| :---: | :---: | :--- | :--- |
| 1.0 | 02/04/2026 | Lidia Ning Fernández Casillas | Creación del documento base. |
| 1.1 | 07/04/2026 | Lidia Ning Fernández Casillas | Adición de prompt para la generación de solución. |
| 1.2 | 02/05/2026 | Lidia Ning Fernández Casillas | Actualización de prompts existentes y adición de otros nuevos.  |
| 1.3 | 04/05/2026 | Lidia Ning Fernández Casillas | Logo y control de versiones añadido. |
| 1.4 | 13/05/2026 | Lidia Ning Fernández Casillas | Actualización de prompts existentes. |

Este documento recoge todos los prompts desarrollados para la extensión **ExamCraft**, organizados de forma clara para facilitar su uso, mantenimiento y mejora.


## ÍNDICE

1. [Generación de Enunciado de la Extensión Funcional](#prompt-1-)  
2. [Generación de Diagrama UML de la Extensión Funcional](#prompt-2-)  
3. [Generación de Ejercicio "Restricciones de Atributos"](#prompt-3-)  
4. [Generación de Ejercicio "Relaciones entre Entidades"](#prompt-4-)  

5. [Generación de Clases Base del Examen](#prompt-5-)  

6. [Generación de Tests para Restricciones de Atributos](#prompt-6-)
7. [Generación de Tests para Relaciones entre Entidades](#prompt-7-)

8. [Generación de Código Solución para Examen](#prompt-8-)

9. [Generación de Examen Completo](#prompt-9-)  


## PROMPTS

### Prompt 1 📝

- **Título:**  Generación de Enunciado de la Extensión Funcional (*Generation of Functional Extension's Statement*).

- **Descripción:** Define las pautas y reglas a seguir por el modelo LLM para poder generar un enunciado innovador y creativo, y así comenzar con la creación de la extensión funcional del examen de la asignatura *Diseño y Pruebas I* de la Universidad de Sevilla. Previamente se le aporta contexto de la asignatura, la estructura ya existente y usada por los profesores en dicho examen y los conocimientos a querer valorar en el alumno.

    Una extensión funcional es la información que recibe el alumno como contextualización del examen, donde se le presenta la nueva funcionalidad que se deberá añadir al proyecto base del que se parte (Clínica Veterinaria o Ajedrez), contando tanto con un enunciado (el texto) y un diagrama UML que explica a nivel técnico la funcionalidad introducida.

- **Recursos Necesarios:** 
    - Ejemplos de extensiones funcionales de exámenes anteriores.
    - Dominio para el que se va a crear el enunciado de la extensión funcional (Clínica Veterinaria o Ajedrez)

- **Prompt:**  
    ```text
    # PROMPT COMPLETO PARA LA GENERACIÓN DE EXTENSIÓN FUNCIONAL (ENUNCIADO)

    ## Recursos a proporcionar:
    * `functional_extension_examples_previous_exams.md`

    ## Prompt a utilizar:

    Nuestra misión es generar un enunciado tomando el rol de profesores para una asignatura llamada Diseño y Pruebas para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Te voy a pasar enunciados de exámenes de otros años junto con el diagrama UML en código Mermaid que lo acompaña, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

    * Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
    * Tenemos dos tipos de exámenes, uno enfocado a una clínica veterinaria y otro al juego del ajedrez.
    * Respecto a los diagramas UML que te pasaré junto con los ejemplos:

        - Concepto de colores de clases:  

            - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación. 

            - **Clases azules**: La base proporcionada. Son clases ya implementadas con las que las clases rojas interactuarán. Pueden estar sujetas a modificaciones para integrar las nuevas funcionalidades.

            - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

            - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando. Las azules son clases que el profesorado al crear las nuevas extensiones necesitaba para que hubiese un sentido lógico en la funcionalidad y las rojas, pueden variar según la extensión funcional que se le añada.

        - Relaciones, cardinalidad y direccionalidad.
            - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente. 

            - Relaciones rojas entre clases rojas y azules: el atributo de la relación ya viene dado, el alumno solo tendrá que poner la anotación de relación

            - Tendremos relaciones únicamente unidireccionales.

            - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

    * Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

    Sabiendo esto, y entendiéndolo a fondo, cogerás los enunciados de exámenes de ejemplo para usarlos como base en el archivo md llamado “functional_extension_examples” que te adjunto.

    Teniendo estos ejemplos, tu tarea es proporcionarme una extensión de enunciado nueva que sea funcional del proyecto {{DOMAIN}}, que cumpla estos requisitos:

    *	La extensión funcional deberá añadir alguna funcionalidad nueva respecto a los anteriores exámenes, es decir, los exámenes pasados como ejemplo.

    *	**Omite en tu respuesta el código Mermaid**, devuelve solo el enunciado en texto plano explicando la nueva extensión funcional.

    *	Omite en tu respuesta cualquier nota dirigida hacia el alumno y al profesorado.

    *	La extensión funcional devuelta deberá tener la misma estructura narrativa que la de los proporcionados como ejemplo, tanto el principio como el final del enunciado.

    *	La extensión funcional devuelta deberá tener el mismo nivel de detalle que los proporcionados como ejemplo, ni más ni menos, dando BREVES descripciones de los atributos de las nuevas entidades (rojas) y sus relaciones, evita alargar dichas explicaciones.

    *	La extensión funcional deberá mantener la base del dominio.

    *	Sé lo más creativo posible.

    *	Como te he explicado antes, las clases azules eran generadas por el profesorado como apoyo de la lógica nueva creada, por lo que tú evitarás crearlas. Simplemente desde la base de clases negras, genera una extensión funcional de clases rojas usando tu creatividad.

    *	En ningún caso mencionarás ni explicarás el color de las clases que se van a dar, puesto que eso los alumnos lo verán en el diagrama.

    *	Devuélveme directamente el enunciado resultado como si fuera el del examen, sin comentarios entre medio ni indicaciones concretas generadas por ti.

    *	Debido a la ausencia de clases azules, omite en tu respuesta cualquier información acerca de ellas en el enunciado generado, aunque en los enunciados de ejemplos si venga.

    *   Para el dominio de **Ajedrez**, es **MUY IMPORTANTE** que todas las propuestas de enunciado que devuelvas contengan estas 3 clases: ChessMatch, ChessBoard y Piece. Construye la nueva extensión funcional teniendo en cuenta SIEMPRE la existencia de estas clases.
    ```


### Prompt 2 📝

- **Título:**  Generación de Diagrama UML de la Extensión Funcional (*Generation of Functional Extension's UML Diagram*).

- **Descripción:** Define las pautas y reglas a seguir por el modelo LLM para poder generar correctamente el código en formato Mermaid del diagrama UML de la extensión funcional del examen. Entre dichas pautas se define el formato y el estilo de las entidades y del código a devolver, aportando contexto previamente del examen que queremos crear e indicando las partes que el alumno deberá implementar y cuáles no.

- **Recursos Necesarios:** 
    - Ejemplos de extensiones funcionales de exámenes anteriores.
    - Dominio del proyecto.
    - Enunciado de extensión funcional en el cual basará su creación.

- **Prompt:**  
    ```text
    # PROMPT PARA LA GENERACIÓN DE EXTENSIÓN FUNCIONAL (DIAGRAMA UML) - ENTIDADES, ATRIBUTOS, RELACIONES

    ## Recursos a proporcionar:
    * `functional_extension_examples_previous_exams.md`

    ## Prompt a utilizar:

    Una vez que tenemos la extensión funcional completa del nuevo examen, pasaremos a la siguiente tarea que quiero que realices.

    Quiero que en base a la lógica de la extensión funcional que me has pasado, me generes un diagrama UML en código Mermaid similar al de los ejemplos que te he pasado en el documento md “functional_extension_examples”. Ten en cuenta estos requisitos:

    -  Recuerda todo el contexto dado en la anterior petición.

    -  Para el dominio de **Ajedrez**, es **MUY IMPORTANTE** que todas las propuestas que devuelvas contengan estas 3 clases: ChessMatch, ChessBoard y Piece. Construye la nueva extensión funcional teniendo en cuenta SIEMPRE la existencia de estas clases.

    -  De los enunciados de ejemplo, céntrate en la estructura del código Mermaid de los del proyecto {{DOMAIN}}

        - IMPORTANTE: Ignora si los ejemplos están compactados; tú debes aplicar siempre las reglas de saltos de línea estrictas mencionadas abajo.
        - De ellos, mantendrás la estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), de las clases base, es decir, las de color negro.

    -  Para las nuevas clases a implementar por el alumno, es decir, clases rojas, añadirás toda su estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), acorde a la extensión funcional generada.

    -  Para las relaciones, asigna siempre un nombre a estas, ya que deberá constar en el diagrama.

    - **COLOREADO DE RELACIONES:** A cada relación entre entidades que hayas generado y que ÚNICAMENTE salgan de las nuevas clases a implementar por el alumno, es decir, de las clases rojas, deberás asignarle el color rojo. Siguiendo este ejemplo:
    `ChessPuzzle "0..n" --> "1" TacticalTheme: <font color=red>theme</font>`

    - **COLOREADO DE CLASES ROJAS**: Para ÚNICAMENTE las nuevas clases a implementar por el alumno, es decir, clases rojas, añade el color rojo. Este estilo deberás añadirlo al final de todo el código Mermaid siguiendo este ejemplo:
    `style ChessPuzzle stroke:red,color:red`
    `style PuzzleAttempt stroke:red,color:red`
    Para el resto de clases de las que partimos deberás EVITAR A TODA COSTA colorearlas de ningún color. Déjalas sin nada.

    -    REGLA ESTRICTA DE FORMATO: Genera código Mermaid válido y estándar. Limítate exclusivamente a definir las clases (coloreando de rojo las que deberá implementar el alumno), sus atributos, métodos y las relaciones (coloreando de rojo las relaciones que salgan de las clases rojas) entre ellas. Separa cada instrucción con un salto de línea.

    REGLAS ESTRICTAS DE SINTAXIS MERMAID (obligatorio cumplir todas):

    1. Usa SIEMPRE `-->` para asociaciones. NUNCA escribas `--` con `>` separado al final.
    - CORRECTO: `Owner "1" --> "0..n" Pet : owns`
    - INCORRECTO: `Owner "1" -- "0..n" Pet : owns >`

    2. NUNCA uses comillas escapadas. Las comillas de multiplicidad van sin barra invertida.
    - CORRECTO: `Owner "1" --> "0..n" Pet : owns`
    - INCORRECTO: `Owner \"1\" --> \"0..n\" Pet : owns`

    3. EVITA usar `classDef` ni `linkStyle`.

    4. NUNCA pongas texto introductorio ni explicaciones antes o después del código.
    El resultado debe empezar DIRECTAMENTE con `classDiagram` y nada más.

    5. Cada clase, atributo y relación en su propia línea. Sin líneas vacías dentro de una clase.

    6. Formato exacto de relaciones:
    - Herencia:    `NamedEntity <|-- Pet`
    - Asociación:  `Owner "1" --> "0..n" Pet : owns`
    - Sin nombre:  `Visit "0..n" --> "1" Vet`

    7. ESTRUCTURA DE LLAVES OBLIGATORIA: Incluso si una clase no tiene atributos, EVITA usar el formato compacto `{}`. Usa siempre saltos de línea.
    - CORRECTO:
        class Vet {
        }
    - INCORRECTO: class Vet {}

    8. PROHIBIDO PEGAR CLASES: Está TERMINANTEMENTE PROHIBIDO pegar el cierre de una clase `}` con el inicio de otra `class` en la misma línea. Siempre debe haber un salto de línea real después de cada `}`.
    - CORRECTO:
        }
        class Owner {
    - INCORRECTO: }class Owner {

    9. ESPACIADO DE RELACIONES: Añade una línea en blanco entre la última clase definida y la primera relación (flecha) para asegurar la correcta lectura del parser.
    ```

### Prompt 3 📝

- **Título:**  Generación de Ejercicio "Restricciones de Atributos" (*Generation of Attribute Constraints*).

- **Descripción:** Define las pautas y reglas a seguir por el modelo LLM para poder generar correctamente las instrucciones del ejercicio "Restricciones de Atributos" del examen a crear, a partir de una extensión funcional (Enunciado y Diagrama UML) dada internamente como contexto. En este ejercicio se definen las diferentes restricciones que deberán tener los atributos de las entidades a implementar por el alumno.

- **Recursos Necesarios:** 
    - Ejemplos de restricciones de atributos de exámenes anteriores.
    - Extensión funcional en la que se basará para la generación.
    - Dominio del proyecto.

- **Prompt:**  
    ```text
    # PROMPT PARA LA GENERACIÓN DE RESTRICCIONES DE ATRIBUTOS A PARTIR DE UN ENUNCIADO CONCRETO

    ## Recursos a proporcionar:
    * `attribute_constraints_examples_previous_exams.md`

    ## Prompt a utilizar:

    Nuestra misión es generar, a partir de un enunciado dado, el ejercicio de un examen, tomando el rol de profesores para una asignatura llamada Diseño y Pruebas, para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Concretamente te pasaré el enunciado y el diagrama UML en código Mermaid que lo acompaña, elementos en los que te tendrás que basar para proporcionarme la solución, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

    -	Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.

    -	Tenemos dos tipos de exámenes, uno enfocado a una clínica veterinaria y otro al juego del ajedrez.

    -	Respecto al diagrama UML:

        -	Concepto de colores de clases: 

            - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación. 

            - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

            - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando y las rojas, pueden variar según la extensión funcional que se le añada.

        -	Relaciones, cardinalidad y direccionalidad:

            - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente.

            - Tendremos relaciones únicamente unidireccionales.

            - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

    - Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

    Sabiendo y entendiendo esto a fondo, basándote y siguiendo la lógica del enunciado y el diagrama UML en código Mermaid que te proporciono en la sección de contexto de este mensaje, quiero que me generes el ejercicio “RESTRICCIONES DE ATRIBUTOS” del examen, es decir, las restricciones a nivel de entidad de los atributos que componen las clases a implementar por el alumno, es decir, de las clases rojas. (not null, etc). Para ello, te adjunto el archivo md llamado “attribute_constraints_examples_previous_exams” como referencia. Deberá cumplir estos requisitos:

    -	ÚNICAMENTE generarás las restricciones a nivel de entidad de los atributos de las clases a implementar por el alumno.

    -	Las restricciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

    -	Omitirás en tu respuesta cualquier mención y explicación sobre las restricciones de los atributos correspondientes a las relaciones entre las entidades, eso se definirá más adelante.

    -	Sé lo más creativo posible en cuanto a restricciones, ni muy simples, ni muy complejas.

    -	El enunciado deberá seguir la siguiente sintaxis:

        *“Modificar las clases [“clases a implementar nuevas (rojas)”] para que sean entidades. Estas deben tener los siguientes atributos y restricciones:*

        *Para la clase [clase a implementar nueva (roja)]:*
        *El atributo de tipo [tipo de atributo] llamado [nombre de atributo] actuará como [opcional/obligatorio], [restricciones explicadas en forma de texto]”*

    -	Al final del enunciado generado, añadirás este párrafo:

        *“No modifique por ahora las anotaciones @Transient de las clases. Modificar las interfaces [repositorios de entidades nuevas a implementar por el alumno (rojas), no siendo enumerados] alojada en el mismo paquete para que extienda a CrudRepository.”*

    ```

### Prompt 4 📝

- **Título:**  Generación de Ejercicio "Relaciones entre Entidades" (*Generation of Entity Relationships*).

- **Descripción:** Define las pautas y reglas a seguir por el modelo LLM para poder generar correctamente las instrucciones del ejercicio "Relaciones entre Entidades" del examen a crear, a partir de una extensión funcional (Enunciado y Diagrama UML) dada internamente como contexto. En este ejercicio se definen las diferentes relaciones que deberán tener las entidades a implementar por el alumno.

- **Recursos Necesarios:** 
    - Ejemplos de relaciones entre entidades de exámenes anteriores.
    - Extensión funcional en la que se basará para la generación.
    - Dominio del proyecto.

- **Prompt:**  
    ```text
    # PROMPT COMPLETO PARA GENERACIÓN DE RELACIONES ENTRE ENTIDADES A PARTIR DE UN ENUNCIADO CONCRETO

    ## Recursos a proporcionar:
    * `relationships_between_entities_examples_previous_exams.md`

    ## Prompt a utilizar:

    Nuestra misión es generar, a partir de un enunciado dado, el ejercicio de un examen, tomando el rol de profesores para una asignatura llamada Diseño y Pruebas, para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Concretamente te pasaré el enunciado y el diagrama UML en código Mermaid que lo acompaña, elementos en los que te tendrás que basar para proporcionarme la solución, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

    -	Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
    -	Tenemos dos tipos de exámenes, uno enfocado a una clínica veterinaria y otro al juego del ajedrez.
    -	Respecto al diagrama UML:

        - 	Concepto de colores de clases:  
            - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación. 
            - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

            - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando y las rojas, pueden variar según la extensión funcional que se le añada.

        -	Relaciones, cardinalidad y direccionalidad:

            - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente. 

            - Tendremos relaciones únicamente unidireccionales.

            - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

    -	Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

    Sabiendo y entendiendo esto a fondo, basándote y siguiendo la lógica del enunciado y el diagrama UML en código Mermaid que te proporciono en la sección de contexto de este mensaje, quiero que me generes el ejercicio “RELACIONES ENTRE ENTIDADES” del examen, es decir, describirás en detalle las relaciones a implementar por el alumno entre las distintas entidades, es decir, entre las clases rojas. Para ello, se te adjunta un archivo md llamado “relationships_between_entities_examples_previous_exams” con ejemplos de exámenes anteriores ya realizados.

    Deberá cumplir estos requisitos:

    -	Lo que vamos a proporcionar al alumno es un proyecto real que tendrá que manipular, por lo que los atributos de las nuevas clases tendrán anotaciones @Transient, que deberán eliminarse en este ejercicio. Esto se debe indicar explícitamente en este ejercicio.

    -   Deberás indicar las relaciones a implementar de las entidades ROJAS, es decir, de las entidades que se han añadido a la nueva funcionalidad y que el alumno deberá implementar, evitando dejar ninguna relación atrás. Puedes apoyarte en el apartado del código Mermaid donde se definen todas ellas.

    -	Las explicaciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

    -	Se debe especificar la direccionalidad de las relaciones a implementar y las entidades implicadas en cada una de ellas.

    -	Se debe indicar que las relaciones deberán corresponderse con lo indicado en el diagrama UML proporcionado al alumno. 

    -	Se debe indicar el nombre del atributo que identificará a la relación y la clase en la que tendrá que estar, en el caso en el que proceda.

    -	Se debe indicar que deberá implementar correctamente la cardinalidad de la relación, poniendo ejemplos simples de la relación actual para que se entienda bien.

    -	Omite en tu respuesta cualquier anotación para los alumnos y criterios de evaluación, solo devuelve lo que se te especifica.

    -	El enunciado deberá seguir la siguiente sintaxis:

        *“Elimine las anotaciones @Transient de los métodos y atributos que las tengan en las entidades creadas en el ejercicio anterior, (así como del atributo [atributo] de la clase [clase]). Se pide crear las siguientes relaciones entre las entidades:”*

        *“Además, se pide crear dos relaciones [direccionalidad] desde “[clase origen]” hacia “[clase destino]” que representen las que aparecen en el diagrama UML, tenga en cuenta la cardinalidad que tienen usando como nombre de los atributos “[nombre de atributo] ” y “[nombre de atributo]” en la clase “[clase]”. Debe asegurarse de que las relaciones expresan adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo, algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero otros no, porque su cardinalidad en el extremo navegable de la relación es 1..n.”*
     ```


### Prompt 5 📝

- **Título:**  Generación de Clases Base del Examen (*Generation of Exam Bases Classes*).

- **Descripción:** Establece las pautas y reglas que el modelo LLM debe seguir para generar de manera correcta y ordenada el código Java de cada una de las clases base que se proporcionarán al alumno. Este código se utilizará para subirlo automáticamente al repositorio del examen desde el cual el alumno comenzará a implementar los ejercicios, creando así todas las clases necesarias. Por lo tanto, la generación de este código es de vital importancia.

    Para ello, se proporciona al modelo la estructura específica que deben tener las entidades, servicios y repositorios correspondientes a las entidades que el alumno debe implementar o que no se encuentren ya en el repositorio plantilla del examen. Previamente, se entrega como contexto ejemplos de clases generadas en otros exámenes, a fin de guiar la correcta creación de las nuevas clases.

- **Recursos Necesarios:** 
    - Ejemplos de estructura de clases base de exámenes anteriores. 
    - Dominio del proyecto elegido (Clínica Veterinaria o Ajedrez).
    - Clases ya existentes en el repositorio plantilla correspondiente.

- **Prompt:**  
    ```text
    # PROMPT PARA LA GENERACIÓN DE CLASES BASE A SUBIR AL REPOSITORIO EXAMEN

    ## Recursos a proporcionar:
    * `base_classes_structure_examples_previous_exams.md`

    ## Prompt a utilizar:

    Actúa como un desarrollador Senior de Java y Spring Boot experto en la creación de esqueletos de código para exámenes universitarios. 

    Tu tarea es analizar el diagrama UML que se te pasará como contexto y generar las clases base (Entidad, Repositorio y Servicio) únicamente para las entidades nuevas que el alumno debe desarrollar, siguiendo estrictamente una plantilla de estilo.

    ### DATOS DE ENTRADA
    - Dominio del proyecto: {dominio}
    - Clases que YA EXISTEN en el repositorio (debes EVITAR generarlas en todos los casos): {clases_existentes}

    ### REGLAS DE GENERACIÓN (ESTRICTAS)
    1. IDENTIFICACIÓN: Compara las entidades del "Diagrama UML" con las "Clases que YA EXISTEN". Genera código ÚNICAMENTE para las entidades del UML que estén AUSENTES en la lista de clases existentes. Por ejemplo, si la clase `Lugar` se encuentra en la lista de clases existentes, OMITIRÁS la creación tanto de la entidad, el repositorio y el servicio correspondiente a ella.
    2. ESTRUCTURA DE ARCHIVOS: Para cada entidad nueva identificada (ej. `Cita`), debes crear una carpeta con su nombre en minúsculas y dentro tres archivos:
    - La entidad en sí (ej. `Cita.java`)
    - El repositorio (ej. `CitaRepository.java`)
    - El servicio (ej. `CitaService.java`)
    3. FORMATO DE CÓDIGO: El código generado debe ser un esqueleto inicial para que el alumno lo complete. Debes imitar EXACTAMENTE la estructura, anotaciones JPA/Spring y nivel de detalle proporcionado en el archivo md llamado "base_classes_structure_examples.md". EVITA añadir lógica de negocio adicional y resolver el examen. En cada entidad, deberás poner SIEMPRE la anotación `@Table(name="nombre_entidad")` y su correspondiente importación de jakarta. Ej: Para la entidad Event: `@Table(name = "events")`
    4. CERO EXPLICACIONES: Devuelve ÚNICAMENTE el código fuente. EVITA hacer saludos, explicaciones de tus decisiones y comentarios finales.

    ### FORMATO DE SALIDA OBLIGATORIO
    Para que el sistema automatizado pueda procesar tu respuesta, debes devolver cada archivo utilizando exactamente este formato (fíjate en la ruta de la carpeta):

    - Para el dominio **Clínica Veterinaria** (IMPORTANTE LAS MAYÚSCULAS Y MINÚSCULAS, DEBEN SEGUIR EL FORMATO INDICADO): src/main/java/org/springframework/samples/petclinic/[nombreCarpeta]/[NombreClase].java;
        ```java
        // Código Java aquí
        ```
    - Para el dominio **Ajedrez** (IMPORTANTE LAS MAYÚSCULAS Y MINÚSCULAS, DEBEN SEGUIR EL FORMATO INDICADO): src/main/java/es/us/dp1/chess/tournament/[nombreCarpeta]/[NombreClase].java;
        ```java
        // Código Java aquí
        ```
    ```


### Prompt 6 📝

- **Título:**  Generación de Tests para Restricciones de Atributos (*Generation of Attributes Constraints Tests*).

- **Descripción:** Establece las pautas y reglas que el modelo LLM debe seguir para generar de manera correcta y ordenada el código Java de las clases de tests para el ejercicio de Restricciones de Atributos, encargadas de verificar automáticamente si el código implementado por el alumno, es decir, la respuesta al examen, es correcto.

    Dado que se parte de un examen plantilla, la estructura de dichos tests debe ser estrictamente precisa para garantizar el correcto funcionamiento del sistema de evaluación automática. Previamente, al modelo se le proporciona el contexto completo del examen, con el fin de orientar adecuadamente la generación de los tests.

- **Recursos Necesarios:** 
    - Ejemplos de tests de Restricciones de Atributos y Relaciones entre Entidades de exámenes anteriores

- **Prompt:**  
    ```text
    # PROMPT COMPLETO PARA GENERACIÓN DE TESTS DE RESTRICCIONES DE ATRIBUTOS

    ## Recursos a proporcionar:
    * `test_previous_exams.md`

    ## Prompt a utilizar:
    Nuestra misión es generar el test de un examen de la asignatura "Diseño y Pruebas". Actuamos como profesores evaluando conocimientos de JPA y mapeo objeto-relacional. Te proporcionaré el enunciado, el diagrama UML en Mermaid y, **CRÍTICAMENTE, el Código Base de las clases ya generadas**.

    Por favor, no uses Wildcard Imports (asteriscos). Genera todos los imports de forma explícita, uno por cada clase utilizada. IMPORTANTE CENTRARSE EN LAS CLASES QUE SE PROPORCIONA COMO CÓDIGO BASE, DE SU LOCALIZACIÓN PARA PODER PONER CORRECTAMENTE LOS IMPORTS DE DONDE SE SACAN LAS CLASES.

    ---

    ## REGLA ABSOLUTA — PAQUETES: LEE EL CÓDIGO BASE, EVITA INVENTAR

    Esta es la regla más importante del prompt. Debes seguirla antes que cualquier otra cosa.
    Además, para las clases que no estén implementadas en el código base, buscarla en el repositorio pasado, como Pet, viene de pet.Pet

    **Procedimiento obligatorio antes de escribir un solo import:**

    1. Localiza la sección `=== PAQUETES DE LA PLANTILLA DEL PROYECTO ===` del contexto. En ella se te especificará la estructura de los paquetes a importar.
    2. Para cada clase que necesites importar, busca su `package` en el código base proporcionado.
    3. Construye el import como: `import <package_de_esa_clase>.<NombreClase>;`
    - Deberás tener cuidado y poner los nombres de las clases nueva generadas, ya que no siempre es Achievement; deberás coger las clases del contexto que se te proporciona de la extensión funcional.

    **Ejemplo concreto:**
    - Si el código base de `Achievement.java` empieza con `package es.us.dp1.chess.tournament.achievement;`
    - El import correcto en el test es: `import es.us.dp1.chess.tournament.achievement.Achievement;`
    - Teniendo en cuenta las mayúsculas y minúsculas de las clases para evitar el error en los tests
    - NUNCA: `import org.springframework.samples.chessgame.model.Achievement;`
    - NUNCA: `import org.springframework.samples.petClinic.model.Achievement;`

    **Aplica lo mismo para `@ComponentScan`:**
    Al definir los paquetes, SIEMPRE poner los paquetes individuales necesarios, evitar globalizar en uno todo:
    - CORRECTO: `@ComponentScan(basePackages = {"es.us.dp1.chess.tournament.achievement", "es.us.dp1.chess.tournament.userAchievement"})`
    - INCORRECTO: `@ComponentScan(basePackages = {"org.springframework.samples.chessgame.repository", "org.springframework.samples.chessgame.model"})`
    - INCORRECTO: `@ComponentScan(basePackages = {"es.us.dp1.chess.tournament"})`

    **El paquete del propio test (`package ...` en la primera línea) también debe derivarse del código base**, usando el prefijo de donde se crean los test. Ejemplo: si el prefijo raíz es `es.us.dp1.chess.tournament`, el paquete del test será `es.us.dp1.chess.tournament`.

    Si una clase (como `ReflexiveTest`, `NamedEntity`, etc.) no aparece en el código base proporcionado, usa el mismo prefijo raíz detectado para inferir su paquete. Nunca uses `org.springframework.samples.*` salvo que ese prefijo aparezca explícitamente en el código base.

    Para las diferentes comprobaciones, vamos a llamar a los métodos que nos proporciona la clase ReflexiveTest que te paso dentro del archivo `test_previous_exams`. **IMPORTANTE:** tienes que llamar con el MISMO NOMBRE a los métodos que utilices, además de pasarle los MISMOS tipos de argumentos que pide cada método. A continuación, te proporciono una lista con todos los métodos disponibles y sus correspondientes argumentos necesarios. Los analizarás todos para usarlos correctamente en el test:
        ```java
        void checkThatFieldIsAnnotatedWithDateTimeFormat(Class aClass, String fieldname,String format)

        void checkThatFieldIsAnnotatedWith(Class aClass, String fieldname,Class annotationClass)

        boolean  isFieldAnnotatedWith(Class aClass, String fieldname,Class annotationClass) throws NoSuchFieldException, SecurityException

        boolean classIsAnnotatedWith(Class class1, Class class2)

        boolean classHasMethod(Object targetObject, String methodName, Class<?> ... parameterTypes)

        void checkThatFieldsAreMandatory(Object validEntity,EntityManager em,String ... fieldnames )

        void checkThatFieldIsMandatory(Object validEntity,String fieldname,Class<?> type,EntityManager em)

        void checkThatValuesAreNotValid(Object validEntity,Map<String,List<Object>> invalidValues,EntityManager em)

        void checkThatValueIsNotValid(Object validEntity,String fieldname,Object value,Class<?> type, EntityManager em)

        Object setValue(Object object,String fieldname,Class<?> type, Object value)

        Object invokeMethodReflexivelyWithParamTypes(Object targetObject, String methodName, Class<?>[] parameterTypes,Object ... parameterValues)

        Object invokeMethodReflexively(Object o, String methodName, Object ... params)

        void checkLinkedById(Class myClass,Integer id1,String methodName,Integer id2,EntityManager em)

        Object getFieldValueReflexively(Object o, String fieldName)

        void checkTransactional(Class<?> myClass,String methodName, Class<?>... parameterTypes)

        boolean isMethodAnnotatedWithTest(Method method)

        boolean isMethodAnnotatedWithBeforeEach(Method method)

        boolean isMethodAnnotatedWithAfterEach(Method method)

        void checkTransactionalRollback(Class<?> myClass,String methodName,Class<?>[] paramTypes,Class<? extends Exception> exceptionClass)

        boolean isEntity(Class<T> clazz)
        ```

    ---

    ## Reglas de Coherencia Adicionales
    2.  **Fidelidad al Código Base:** Si una clase en el código base tiene un atributo con un nombre específico (ej. `checkInDate`), el test debe usar ese nombre exacto, ignorando lo que diga cualquier otro ejemplo externo.
    3.  **Manejo de Relaciones:** Si en el Código Base una relación está marcada como `@Transient`, el test debe tratarla según las instrucciones del enunciado, pero siempre importando la clase desde su paquete real.

    ---

    ## Especificaciones del Examen
    - **Clases Negras:** Núcleo estable (Contexto). No se testea su implementación interna, pero se usan para crear objetos válidos (ej. `Owner`, `Pet`).
    - **Clases Rojas:** Tarea principal del alumno. Son las que debemos testear exhaustivamente (Restricciones, Anotaciones y Persistencia).
    - **Límite:** Máximo 2 entidades rojas por examen.
    - **Framework:** Java 17+, JUnit 5, Spring Boot (@DataJpaTest).
    - **Herencia:** La clase de test DEBE extender de `ReflexiveTest` (IMPORTANTE: DEBE USARSE SI O SI ESTA CLASE PARA LA GENERACIÓN DE LOS TESTS, DEBE PONER ReflexiveTest en la parte de `extends...`)

    ---

    ## Estructura Estricta Requerida para Test1.java

    ### 1. Configuración e Inyección
    - El nombre ESTRICTO del paquete donde se tiene que generar el test es:
        - Clínica Veterinaria: `package org.springframework.samples.petclinic`
        - Ajedrez: `package es.us.dp1.chess.tournament`
    - Inyecta los Repositorios de las entidades rojas y el `EntityManager` mediante `@Autowired` (NUNCA `TestEntityManager`).
    - Inyecta SIEMPRE como `@MockBean` el servicio `UserService`: 
        ```java
            @MockBean
            private UserService userService;
        ```
    - Usa `@ComponentScan` apuntando a los paquetes reales detectados en el Código Base (ver Regla Absoluta).
    - **IMPORTANTE** los imports de las anotaciones a comprobar deberán venir de jakarta, NUNCA DE javax:
        - CORRECTO: jakarta.persistence.Column;
        - INCORRECTO: javax.persistence.Column;
    - **IMPORTANTE**: Omitir crear tests estáticos, para poder usar el método `super`.


    ### 2. Verificación de Repositorios
    Los tests que validan los repositorios, cuando extienden a CRUD Repository no es necesario validar todos los métodos que se proporcionan inicialmente en las clases base, ya que la anotación CRUD los contiene, por lo que la estructura del test sería:

        ```java
        @Test
            void test1RepositoriesExist() {
                assertNotNull(ratingRepository, "RatingRepository should be autowired");
                assertNotNull(ratingChangeRepository, "RatingChangeRepository should be autowired");
                test1RepositoriesContainsMethod();
            }

            void test1RepositoriesContainsMethod() {
                assertTrue(
                    CrudRepository.class.isAssignableFrom(RatingRepository.class),
                    "RatingRepository should extend CrudRepository"
                );
                assertTrue(
                    CrudRepository.class.isAssignableFrom(RatingChangeRepository.class),
                    "RatingChangeRepository should extend CrudRepository"
                );
            }

        ```

    - **test1RepositoriesExist():** Verifica `assertNotNull`. Al final, debe llamar a `test1RepositoriesContainsMethod()` solo si el repo no es nulo.
    - **test1RepositoriesContainsMethod():** (SIN @Test) Verifica que el repo tiene el método `.count()` o similar mediante reflexión/interfaz.


    ### 3. Validación de Restricciones (Constraints)

    - **test1Check[NOMBRE_ENTIDAD]Constraints():**
        - Invoca `checkThatFieldsAreMandatory` con los campos `NotNull/NotBlank` identificados.
        - Crea el mapa `invalidValues` usando `Map.of(...)`. **PROHIBIDO usar `new HashMap()`**.
        - Los valores de prueba deben ser coherentes con el tipo de dato del Código Base (si es `Double`, usa `0.0`; si es `Integer`, `0`).
        - Invoca `checkThatValuesAreNotValid`.
        - En atributos que sean de tipo Double, NUNCA PONER `columnDefinition = "double(5,2)"` ya que dará error. La forma correcta es por ejemplo: `@Column(name = "cost")`

    ### 4. Verificación de Anotaciones
    - **test1Check[NOMBRE_ENTIDAD]Annotations():**
        - Verifica `@Entity` con `classIsAnnotatedWith`.
        - Verifica `@Enumerated(EnumType.STRING)` si hay Enums.
        - Verifica `@Size`, `@Positive`, `@FutureOrPresent`, etc., según el UML.

    ### 5. Métodos Auxiliares y Persistencia
    - **createValid[NOMBRE_ENTIDAD](EntityManager em):** Método estático que construye una instancia válida.
    - **IMPORTANTE:** Usa EXCLUSIVAMENTE `setValue(objeto, "atributo", Tipo.class, valor)` para asignar datos, evitando fallos si no existen setters.
    - **test1Valid[NOMBRE_ENTIDAD]IsPersisted():** Verifica que `repo.save()` no lanza excepciones (`assertDoesNotThrow`) y haz `.flush()`.
    - Todos los métodos auxiliares que sean necesarios deberán crearse en la misma clase, el test DEBE ser autosuficiente.
    - Al crear alguna entidad válida en un método auxiliar, SIEMPRE crear primero los objetos padre, es decir, si un Pet tiene un Owner, primero se deberá crear el Owner y después el Pet. Esto evitará errores de persistencia.
    ---

    ## Restricciones de Salida (Formato)
    - **PROHIBIDO** generar comentarios explicativos.
    - **PROHIBIDO** envolver el código en bloques de código markdown (sin \`\`\`java).
    - **PROHIBIDO** incluir texto antes o después del código.
    - Entrega el código listo para ser copiado y pegado en un archivo `.java`.
    ```

### Prompt 7 📝

- **Título:**  Generación de Tests para Relaciones entre Entidades (*Generation of Entity Relationships Tests*).

- **Descripción:** Establece las pautas y reglas que el modelo LLM debe seguir para generar de manera correcta y ordenada el código Java de las clases de tests para el ejercicio de Relaciones entre Entidades, encargadas de verificar automáticamente si el código implementado por el alumno, es decir, la respuesta al examen, es correcto.

    Dado que se parte de un examen plantilla, la estructura de dichos tests debe ser estrictamente precisa para garantizar el correcto funcionamiento del sistema de evaluación automática. Previamente, al modelo se le proporciona el contexto completo del examen, con el fin de orientar adecuadamente la generación de los tests.

- **Recursos Necesarios:** 
    - Ejemplos de tests de Restricciones de Atributos y Relaciones entre Entidades de exámenes anteriores

- **Prompt:**  
    ```text
   # PROMPT COMPLETO PARA GENERACIÓN DE TESTS DE RELACIONES ENTRE ENTIDADES

    ## Recursos a proporcionar:
    * `test_previous_exams.md`

    ## Prompt a utilizar:
    Nuestra misión es generar el test de un examen de la asignatura "Diseño y Pruebas". Actuamos como profesores evaluando conocimientos de JPA y mapeo objeto-relacional. Te proporcionaré el enunciado, el diagrama UML en Mermaid y, **CRÍTICAMENTE, el Código Base de las clases ya generadas**.

    Por favor, no uses Wildcard Imports (asteriscos). Genera todos los imports de forma explícita, uno por cada clase utilizada. IMPORTANTE CENTRARSE EN LAS CLASES QUE SE PROPORCIONA COMO CÓDIGO BASE, DE SU LOCALIZACIÓN PARA PODER PONER CORRECTAMENTE LOS IMPORTS DE DONDE SE SACAN LAS CLASES.

    ---

    ## REGLA ABSOLUTA — PAQUETES: LEE EL CÓDIGO BASE, EVITA INVENTAR

    Esta es la regla más importante del prompt. Debes seguirla antes que cualquier otra cosa.
    Además, para las clases que no estén implementadas en el código base, buscarla en el repositorio pasado, como Pet, viene de pet.Pet

    **Procedimiento obligatorio antes de escribir un solo import:**

    1. Localiza la sección `=== PAQUETES DE LA PLANTILLA DEL PROYECTO ===` del contexto. En ella se te especificará la estructura de los paquetes a importar.
    2. Para cada clase que necesites importar, busca su `package` en el código base proporcionado.
    3. Construye el import como: `import <package_de_esa_clase>.<NombreClase>;`
    - Deberás tener cuidado y poner los nombres de las clases nueva generadas, ya que no siempre es Achievement; deberás coger las clases del contexto que se te proporciona de la extensión funcional.

    **Ejemplo concreto:**
    - Si el código base de `Achievement.java` empieza con `package es.us.dp1.chess.tournament.achievement;`
    - El import correcto en el test es: `import es.us.dp1.chess.tournament.achievement.Achievement;`
    - Teniendo en cuenta las mayúsculas y minúsculas de las clases para evitar el error en los tests
    - NUNCA: `import org.springframework.samples.chessgame.model.Achievement;`
    - NUNCA: `import org.springframework.samples.petClinic.model.Achievement;`

    **Aplica lo mismo para `@ComponentScan`:**
    Al definir los paquetes, SIEMPRE poner los paquetes individuales necesarios, evitar globalizar en uno todo:
    - CORRECTO: `@ComponentScan(basePackages = {"es.us.dp1.chess.tournament.achievement", "es.us.dp1.chess.tournament.userAchievement"})`
    - INCORRECTO: `@ComponentScan(basePackages = {"org.springframework.samples.chessgame.repository", "org.springframework.samples.chessgame.model"})`
    - INCORRECTO: `@ComponentScan(basePackages = {"es.us.dp1.chess.tournament"})`

    **El paquete del propio test (`package ...` en la primera línea) también debe derivarse del código base**, usando el prefijo de donde se crean los test. Ejemplo: si el prefijo raíz es `es.us.dp1.chess.tournament`, el paquete del test será `es.us.dp1.chess.tournament`.

    Si una clase (como `ReflexiveTest`, `NamedEntity`, etc.) no aparece en el código base proporcionado, usa el mismo prefijo raíz detectado para inferir su paquete. Nunca uses `org.springframework.samples.*` salvo que ese prefijo aparezca explícitamente en el código base.

    Para las diferentes comprobaciones, vamos a llamar a los métodos que nos proporciona la clase ReflexiveTest que te paso dentro del archivo `test_previous_exams`. **IMPORTANTE:** tienes que llamar con el MISMO NOMBRE a los métodos que utilices, además de pasarle los MISMOS tipos de argumentos que pide cada método. A continuación, te proporciono una lista con todos los métodos disponibles y sus correspondientes argumentos necesarios. Los analizarás todos para usarlos correctamente en el test:
        ```java
        void checkThatFieldIsAnnotatedWithDateTimeFormat(Class aClass, String fieldname,String format)

        void checkThatFieldIsAnnotatedWith(Class aClass, String fieldname,Class annotationClass)

        boolean  isFieldAnnotatedWith(Class aClass, String fieldname,Class annotationClass)

        boolean classIsAnnotatedWith(Class class1, Class class2)

        boolean classHasMethod(Object targetObject, String methodName, Class<?> ... parameterTypes)

        void checkThatFieldsAreMandatory(Object validEntity,EntityManager em,String ... fieldnames )

        void checkThatFieldIsMandatory(Object validEntity,String fieldname,Class<?> type,EntityManager em)

        void checkThatValuesAreNotValid(Object validEntity,Map<String,List<Object>> invalidValues,EntityManager em)

        void checkThatValueIsNotValid(Object validEntity,String fieldname,Object value,Class<?> type, EntityManager em)

        Object setValue(Object object,String fieldname,Class<?> type, Object value)

        Object invokeMethodReflexivelyWithParamTypes(Object targetObject, String methodName, Class<?>[] parameterTypes,Object ... parameterValues)

        Object invokeMethodReflexively(Object o, String methodName, Object ... params)

        void checkLinkedById(Class myClass,Integer id1,String methodName,Integer id2,EntityManager em)

        Object getFieldValueReflexively(Object o, String fieldName)

        void checkTransactional(Class<?> myClass,String methodName, Class<?>... parameterTypes)

        boolean isMethodAnnotatedWithTest(Method method)

        boolean isMethodAnnotatedWithBeforeEach(Method method)

        boolean isMethodAnnotatedWithAfterEach(Method method)

        void checkTransactionalRollback(Class<?> myClass,String methodName,Class<?>[] paramTypes,Class<? extends Exception> exceptionClass)

        boolean isEntity(Class<T> clazz)
        ```

    ---

    ## Reglas de Coherencia Adicionales
    2.  **Fidelidad al Código Base:** Si una clase en el código base tiene un atributo o relación con un nombre específico (ej. `checkInDate`), el test debe usar ese nombre exacto, ignorando lo que diga cualquier otro ejemplo externo.
    3.  **Manejo de Relaciones:** Si en el Código Base una relación está marcada como `@Transient`, el test debe tratarla según las instrucciones del enunciado, pero siempre importando la clase desde su paquete real.

    ---

    ## Especificaciones del Examen
    - **Clases Negras:** Núcleo estable (Contexto). No se testea su implementación interna, pero se usan para crear objetos válidos (ej. `Owner`, `Pet`).
    - **Clases Rojas:** Tarea principal del alumno. Son las que debemos testear exhaustivamente (Restricciones, Anotaciones y Persistencia).
    - **Límite:** Máximo 2 entidades rojas por examen.
    - **Framework:** Java 17+, JUnit 5, Spring Boot (@DataJpaTest).
    - **Herencia:** La clase de test DEBE extender de `ReflexiveTest`.

    ---


    ## Estructura Estricta Requerida para Test2.java

    Debes generar una clase de pruebas que siga EXACTAMENTE el patrón de diseño proporcionado, siguiendo los ejemplos proporcionados en el archivo markdown "test_previous_exams" anotados como **Test 2: Relaciones entre las entidades**. La clase evaluará lo necesario apoyándose en los métodos de la clase padre `ReflexiveTest`.

    ### 1. Configuración de la Clase e Inyección de Dependencias
    - **Clase y Herencia:** La clase debe ser pública, estar anotada obligatoriamente con `@DataJpaTest()` y heredar de `ReflexiveTest` (IMPORTANTE: DEBE USARSE SI O SI ESTA CLASE PARA LA GENERACIÓN DE LOS TESTS, DEBE PONER ReflexiveTest en la parte de `extends...`)
    - **Inyección:** Inyecta EXCLUSIVAMENTE el `EntityManager` utilizando `@Autowired(required = false)` (NUNCA TestEntityManager). Evita inyectar repositorios a menos que la creación de la entidad base lo requiera de forma crítica.
    - El nombre ESTRICTO del paquete donde se tiene que generar el test es:
        - Clínica Veterinaria: `package org.springframework.samples.petclinic`
        - Ajedrez: `package es.us.dp1.chess.tournament`
    - Inyecta SIEMPRE como `@MockBean` el servicio `UserService`: 
        ```java
            @MockBean
            private UserService userService;
        ```
    - Usa `@ComponentScan` apuntando a los paquetes reales detectados en el Código Base (ver Regla Absoluta).
    - **IMPORTANTE** los imports de las anotaciones a comprobar deberán venir de jakarta, NUNCA DE javax:
        - CORRECTO: jakarta.persistence.Column;
        - INCORRECTO: javax.persistence.Column;


    ### 2. Verificación de Anotaciones (Relaciones JPA)
    - **Nomenclatura del Método:** Crea un método llamado `test[Num][NombreEntidad]Annotations()` por cada entidad a evaluar (ej. `test2TreatmentAnnotations()`). Debe ser `public void` y llevar la anotación `@Test`.
    - **Implementación (Estricta):** Dentro del método, usa ÚNICAMENTE el método heredado `checkThatFieldIsAnnotatedWith` para comprobar relaciones. 
    - **Formato exacto:** `checkThatFieldIsAnnotatedWith(Entidad.class, "nombreDelAtributo", TipoDeRelacion.class);` (Donde `TipoDeRelacion` será `ManyToMany.class`, `ManyToOne.class`, etc.).
    - Agrupa todas las aserciones de una misma entidad en su método correspondiente.


    ### 3. Verificación de Restricciones (Constraints y Obligatoriedad)
    - **Nomenclatura del Método:** Crea un método llamado `test[Num][NombreEntidad]Constraints()` por cada relación a implementar (ej. `test2TreatmentConstraints()`). Es obligatorio que sea `public void` y lleve la anotación `@Test` (evita métodos privados o JUnit no los ejecutará).
    - **Instanciación de la Entidad:** Para probar las restricciones, la primera línea del método debe instanciar una entidad válida llamando a la factoría de `Test1` pasándole el EntityManager. Formato exacto: `NombreEntidad e = Test1.createValid[NombreEntidad](em);`
    - **Filtro de Atributos (¡IMPORTANTE!):** Genera aserciones ÚNICAMENTE para los atributos que implementan las relaciones exigidas en este ejercicio. Omite estrictamente cualquier aserción de obligatoriedad para atributos básicos (como ids, nombres, fechas, etc.) que no formen parte de la relación que se está evaluando.
    - **Implementación (Estricta):** Tras instanciar la entidad, usa ÚNICAMENTE el método heredado `checkThatFieldsAreMandatory` para verificar la obligatoriedad de los atributos filtrados en el paso anterior.
    - **Formato exacto:** checkThatFieldsAreMandatory(e, em, "nombreDelAtributoRelacion");


    ### 4. Métodos Auxiliares y Reglas Críticas de Sintaxis
    - **createValid[NOMBRE_ENTIDAD](EntityManager em):** Método estático que construye una instancia válida.
    - **IMPORTANTE:** Usa EXCLUSIVAMENTE `setValue(objeto, "atributo", Tipo.class, valor)` proporcionado por `ReflexiveTest` para asignar datos, evitando fallos si no existen setters.
    - **Evita aserciones estándar:** NO uses `assertNotNull`, `assertDoesNotThrow` ni pruebes repositorios con `.save()` a menos que se te pida explícitamente. Cíñete a los métodos de aserción de `ReflexiveTest` (`checkThatFieldIsAnnotatedWith` y `checkThatFieldsAreMandatory`).
    - **Separación de responsabilidades**: Mantén estrictamente separados los métodos que comprueban anotaciones de los métodos que comprueban restricciones de validación.
    - **Limpieza**: Omite comentarios innecesarios, importaciones no utilizadas y explicaciones adicionales. Devuelve únicamente el código Java solicitado.
    - **IMPORTANTE**: Omitir crear tests estáticos, para poder usar el método `super`.
    - Todos los métodos auxiliares que sean necesarios deberán crearse en la misma clase, el test DEBE ser autosuficiente.
    - Al crear alguna entidad válida en un método auxiliar, SIEMPRE crear primero los objetos padre, es decir, si un Pet tiene un Owner, primero se deberá crear el Owner y después el Pet. Esto evitará errores de persistencia.

    ---

    ## Restricciones de Salida (Formato)
    - **PROHIBIDO** generar comentarios explicativos.
    - **PROHIBIDO** envolver el código en bloques de código markdown (sin \`\`\`java).
    - **PROHIBIDO** incluir texto antes o después del código.
    - Entrega el código listo para ser copiado y pegado en un archivo `.java`.
    ```


### Prompt 8 📝

- **Título:**  Generación de Código Solución para Examen (*Generation of Solution Code for Exam*).

- **Descripción:** Establece las pautas y reglas que el modelo LLM debe seguir para generar de manera correcta y estructurada la solución en código correspondiente a todas los ejercicios generados para un examen concreto. En este contexto, el modelo deberá partir del código base previamente generado en el [prompt 5](#prompt-5-) y aplicar las modificaciones necesarias para implementar la solución completa de los ejercicios, conforme a los requisitos del examen. Dicha solución representa la respuesta oficial del profesor, la cual se pretende automatizar dentro del sistema, garantizando coherencia, precisión y adecuación a las especificaciones planteadas.

- **Recursos Necesarios:** 
    - Enunciado del ejercicio "Restricciones de Atributos" y código de los tests que validan dicho ejercicio.
    - Enunciado del ejercicio "Relaciones entre Entidades" y código de los tests que validan dicho ejercicio.
    - Código base del examen concreto generado en la extensión previamente.

- **Prompt:**  
    ```text
    # PROMPT PARA LA GENERACIÓN DE CÓDIGO SOLUCIÓN COMPLETA (RESTRICCIONES Y RELACIONES)

    ## Prompt a utilizar:

    Actúa como un desarrollador Senior de Java y Spring Boot experto en la resolución de ejercicios universitarios. 

    Tu tarea es tomar un código base (esqueletos de clases) y completarlo aplicando estrictamente tanto las **Restricciones de Atributos** como las **Relaciones entre Entidades** definidas en los enunciados proporcionados. Además, tu implementación debe garantizar que pase con éxito todos los tests de validación proporcionados para ambas partes.

    ### DATOS DE ENTRADA
    - Enunciado de Restricciones de Atributos: {enunciado_restricciones}
    - Tests de Restricciones de Atributos: {codigo_tests_restricciones}
    - Enunciado de Relaciones entre Entidades: {enunciado_relaciones}
    - Tests de Relaciones entre Entidades: {codigo_tests_relaciones}
    - Código Base Actual: {codigo_base_localstorage}

    ### REGLAS DE GENERACIÓN (ESTRICTAS)
    1. ANÁLISIS INTEGRAL: Lee detenidamente ambos enunciados y todos los tests. Aplica las validaciones de atributos (anotaciones de Jakarta/Hibernate Validation) y las relaciones entre entidades (mapeo ORM, cardinalidades, cascadas, fetch) según sea estrictamente necesario. Si algún enunciado indica que "No hay" datos, omite esa parte y céntrate en la otra.
    2. MODIFICACIÓN MÍNIMA Y COHERENTE: Completa únicamente el código de las clases proporcionadas en el "Código Base Actual". Integra ambas soluciones (restricciones y relaciones) de forma armónica en las mismas clases. EVITA crear entidades, repositorios o servicios que no existan ya en el código base. Tu objetivo es *completar*, no reestructurar.
    3. ALINEACIÓN CON LOS TESTS: Los tests proporcionados son la única fuente de la verdad. Si un test espera que se lance una excepción específica (ej. `ConstraintViolationException`), busca un nombre de campo o tabla concreto, o exige un comportamiento de eliminación en cascada, tu código debe coincidir exactamente con esa expectativa.
    4. CERO EXPLICACIONES: Devuelve ÚNICAMENTE el código fuente modificado, en el mismo orden en el que recibes las clases base. EVITA hacer saludos, explicaciones de tus decisiones, comentarios finales o bloques de texto fuera del formato requerido.

    ### FORMATO DE SALIDA OBLIGATORIO
    Para que el sistema automatizado pueda procesar tu respuesta, debes devolver CADA ARCHIVO siguiendo este formato estricto. La ruta debe ser la ruta completa del sistema de archivos que corresponde a la clase (ej: src/main/java/com/example/model/Clase.java):

    [RUTA_EXTRAIDA_DEL_CODIGO_BASE];
    ```java
    // Contenido completo de la clase con la solución completa aplicada
    ```
    ```

### Prompt 9 📝

- **Título:**  Generación de Examen Completo (*Generation of Complete Exam*).

- **Descripción:** Define las pautas y reglas a seguir por el modelo LLM para poder generar correcta y ordenadamente un examen completo, incluyendo en él tanto la extensión funcional, como las instrucciones para los ejercicios de "Restricciones de Atributos" y "Relaciones entre Entidades", consiguiendo así generar la descripción completa del examen de la asignatura de una vez con todas las partes a abordar en este proyecto.

- **Recursos Necesarios:** 
    - Ejemplos de extensiones funcionales de exámenes anteriores.
    - Ejemplos de restricciones de atributos de exámenes anteriores.
    - Ejemplos de relaciones entre entidades de exámenes anteriores.

- **Prompt:**  
    ```text
    # PROMPT COMPLETO PARA LA GENERACIÓN DE EXAMEN COMPLETO DISEÑO Y PRUEBAS I

    ## Recursos a proporcionar:
    * `functional_extension_examples.md`
    * `attribute_constraints_examples_previous_exams.md`
    * `relationships_between_entities_examples_previous_exams.md`

    ## Prompt a utilizar:

    Nuestra misión es generar un enunciado tomando el rol de profesores para una asignatura llamada Diseño y Pruebas para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Te voy a pasar enunciados de exámenes de otros años junto con el diagrama UML en código Mermaid que lo acompaña, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:
    
    * Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
    * Tenemos dos tipos de exámenes, uno enfocado a una **clínica veterinaria** y otro al **juego del ajedrez**.
    
    * Respecto a los diagramas UML que te pasaré junto con los ejemplos:

        - Concepto de colores de clases:
    
        - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación.  

        - **Clases azules**: La base proporcionada. Son clases ya implementadas con las que las clases rojas interactuarán. Pueden estar sujetas a modificaciones para integrar las nuevas funcionalidades. 

        - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

        - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando. Las azules son clases que el profesorado al crear las nuevas extensiones necesitaba para que hubiese un sentido lógico en la funcionalidad y las rojas, pueden variar según la extensión funcional que se le añada.

        - Relaciones, cardinalidad y direccionalidad:
        
        - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente. 

        - Relaciones rojas entre clases rojas y azules: el atributo de la relación ya viene dado, el alumno solo tendrá que poner la anotación de relación

        -	Tendremos relaciones únicamente unidireccionales.

        -	La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

    *	Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

    Sabiendo esto, y entendiéndolo a fondo, cogerás los enunciados de exámenes de ejemplo para usarlos como base en el archivo md llamado “functional_extension_examples” que te adjunto.


    ### EXTENSIÓN FUNCIONAL

    Teniendo estos ejemplos, tu tarea es proporcionarme una extensión de enunciado nueva que sea funcional del proyecto **[ajedrez/clínica veterinaria]**, que cumpla estos requisitos:

    *	La extensión funcional deberá añadir alguna funcionalidad nueva respecto a los anteriores exámenes, es decir, los exámenes pasados como ejemplo.

    *	**Omite en tu respuesta el código Mermaid**, devuelve solo el enunciado en texto plano explicando la nueva extensión funcional.

    *	Omite en tu respuesta cualquier nota dirigida hacia el alumno y al profesorado.

    *	La extensión funcional devuelta deberá tener la misma estructura narrativa que la de los proporcionados como ejemplo, tanto el principio como el final del enunciado.

    *	La extensión funcional devuelta deberá tener el mismo nivel de detalle que los proporcionados como ejemplo, ni más ni menos, dando breves descripciones de los atributos de las nuevas entidades (rojas) y sus relaciones.

    *	La extensión funcional deberá mantener la base del dominio.

    *	Sé lo más creativo posible.

    *	Como te he explicado antes, las clases azules eran generadas por el profesorado como apoyo de la lógica nueva creada, por lo que tú evitarás crearlas. Simplemente desde la base de clases negras, genera una extensión funcional de clases rojas usando tu creatividad.

    *	En ningún caso mencionarás ni explicarás el color de las clases que se van a dar, puesto que eso los alumnos lo verán en el diagrama.

    *	Devuélveme directamente el enunciado resultado como si fuera el del examen, sin comentarios entre medio ni indicaciones concretas generadas por ti.

    *	Debido a la ausencia de clases azules, omite en tu respuesta cualquier información acerca de ellas en el enunciado generado, aunque en los enunciados de ejemplos si venga.

    ---
    Una vez que tenemos la extensión funcional completa del nuevo examen, pasaremos a la siguiente tarea que quiero que realices.

    Quiero que en base a la lógica de la extensión funcional que me has pasado, me generes un diagrama UML en código Mermaid similar al de los ejemplos que te he pasado en el documento “Extensiones funcionales de ejemplo”. Ten en cuenta estos requisitos:

    * Recuerda todo el contexto dado en la anterior petición.

    * De los enunciados de ejemplo, céntrate en los del tipo proyecto del que hemos creado la extensión. (ajedrez o clínica veterinaria)
    -	De ellos, mantendrás la estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), de las clases base, es decir, las de color negro.

    *	Para las nuevas clases a implementar por el alumno, es decir, clases rojas, añadirás toda su estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), acorde a la extensión funcional generada.

    *	Para las relaciones, si estas tienen un nombre asignado, este debe constar en el diagrama.

    *	El color del contenido de las clases negras debe ser negro también.

    *	El color del contenido de las clases rojas debe ser rojo también.


    ### RESTRICCIONES DE ATRIBUTOS

    Una vez creado el diagrama, generarás el enunciado para el ejercicio “RESTRICCIONES DE ATRIBUTOS” del examen, es decir, las restricciones a nivel de entidad de los atributos que componen las clases a implementar por el alumno, es decir, de las clases rojas. (not null, etc). Para ello, te adjunto el archivo md llamado “attribute_constraints_examples_previous_exams” como referencia. Deberá cumplir estos requisitos:

    *	ÚNICAMENTE generarás las restricciones a nivel de entidad de los atributos de las clases a implementar por el alumno.

    *	Las restricciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

    *	Sé lo más creativo posible en cuanto a restricciones, ni muy simples, ni muy complejas.

    *	El enunciado deberá seguir la siguiente sintaxis:

        *“Modificar las clases [“clases a implementar nuevas (rojas)”] para que sean entidades. Estas deben tener los siguientes atributos y restricciones:*

        *Para la clase [clase a implementar nueva (roja)]:*
        *El atributo de tipo [tipo de atributo] llamado [nombre de atributo] actuará como [opcional/obligatorio], [restricciones explicadas en forma de texto]”*

    *	Al final del enunciado generado, añadirás este párrafo:

        *“No modifique por ahora las anotaciones @Transient de las clases. Modificar las interfaces [repositorios de entidades nuevas a implementar por el alumno (rojas), no siendo enumerados] alojada en el mismo paquete para que extienda a CrudRepository.”*

    ### RELACIONES ENTRE ENTIDADES

    Una vez que tenemos la extensión funcional completa del nuevo examen, el diagrama UML y las restricciones de cada atributo, pasaremos a generar el ejercicio “RELACIONES ENTRE ENTIDADES” del examen que estamos creando, es decir, la implementación de las relaciones entre las entidades correspondientes.

    Quiero que en base a la lógica de la extensión funcional, el diagrama UML y las restricciones que me has pasado y que ya tenemos, recordando todo el contexto e información proporcionada previa, describirás en detalle las relaciones a implementar por el alumno entre las entidades descritas anteriormente, es decir, entre las clases rojas. Para ello, se te adjunta un archivo md llamado “relationships_between_entities_examples_previous_exams” con ejemplos de exámenes anteriores ya realizados.

    Deberá cumplir estos requisitos:

    * Lo que vamos a proporcionar al alumno es un proyecto real que tendrá que manipular, por lo que los atributos de las nuevas clases tendrán anotaciones @Transient, que deberán eliminarse en este ejercicio. Esto se debe indicar explícitamente en este ejercicio.

    *	Las explicaciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

    *	Se debe especificar la direccionalidad de las relaciones a implementar y las entidades implicadas en cada una de ellas.

    *	Se debe indicar que las relaciones deberán corresponderse con lo indicado en el diagrama UML proporcionado al alumno. 

    *	Se debe indicar el nombre del atributo que identificará a la relación y la clase en la que tendrá que estar, en el caso en el que proceda.

    *	Se debe indicar que deberá implementar correctamente la cardinalidad de la relación, poniendo ejemplos simples de la relación actual para que se entienda bien.

    *	El enunciado deberá seguir la siguiente sintaxis:

        *“Elimine las anotaciones @Transient de los métodos y atributos que las tengan en las entidades creadas en el ejercicio anterior, (así como del atributo [atributo] de la clase [clase]). Se pide crear las siguientes relaciones entre las entidades:”*

        *“Además, se pide crear dos relaciones [direccionalidad] desde “[clase origen]” hacia “[clase destino]” que representen las que aparecen en el diagrama UML, tenga en cuenta la cardinalidad que tienen usando como nombre de los atributos “[nombre de atributo] ” y “[nombre de atributo]” en la clase “[clase]”. Debe asegurarse de que las relaciones expresan adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo, algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero otros no, porque su cardinalidad en el extremo navegable de la relación es 1..n.”*
     ```