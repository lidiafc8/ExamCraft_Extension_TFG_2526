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