<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = fake('es_ES');

        DB::transaction(function () use ($faker): void {
            $roles = [];
            foreach (['Administrador', 'Docente', 'Encargado', 'Estudiante'] as $name) {
                $roles[$name] = DB::table('roles')->insertGetId(['nombre' => $name]);
            }

            $adminUsers = [];
            foreach (range(1, 4) as $index) {
                $adminUsers[] = $this->createUser($roles['Administrador'], "admin{$index}", "admin{$index}@colegiometodista.test");
            }

            $cycles = [];
            foreach ([2025, 2026] as $year) {
                $cycles[$year] = DB::table('ciclos')->insertGetId([
                    'fecha_inicio' => "{$year}-01-15",
                    'fecha_fin' => "{$year}-11-30",
                    'activo' => $year === 2026,
                ]);
            }

            $grades = [];
            foreach (['Parvularia 6', '1ro Básico', '2do Básico', '3ro Básico', '4to Básico', '5to Básico'] as $name) {
                $grades[] = DB::table('grados')->insertGetId(['nombre' => $name]);
            }

            $subjects = [];
            foreach ([
                ['Lenguaje y Lit.', 'LEN'],
                ['Matemática', 'MAT'],
                ['Ciencias Naturales', 'CIE'],
                ['Estudios Sociales', 'SOC'],
                ['Inglés', 'ING'],
                ['Educación Física', 'EDF'],
            ] as [$name, $code]) {
                $subjects[] = DB::table('asignaturas')->insertGetId([
                    'nombre' => $name,
                    'descripcion' => "Asignatura de {$name}.",
                    'codigo' => $code,
                ]);
            }

            $teachers = [];
            foreach (range(1, 12) as $index) {
                $userId = $this->createUser($roles['Docente'], "docente{$index}", "docente{$index}@colegiometodista.test");
                $teachers[] = DB::table('docente')->insertGetId([
                    'id_usuario' => $userId,
                    'dui' => $faker->unique()->numerify('########-#'),
                    'nombres' => $faker->firstName(),
                    'apellidos' => $faker->lastName(),
                    'telefono' => $faker->numerify('########'),
                    'numero_isss' => $faker->unique()->numerify('###############'),
                    'afp' => $faker->unique()->numerify('AFP-###########'),
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $students = [];
            $guardians = [];
            foreach (range(1, 60) as $index) {
                $lastName = $faker->lastName();
                $studentUserId = $this->createUser($roles['Estudiante'], "estudiante{$index}", "estudiante{$index}@colegiometodista.test");
                $studentId = DB::table('estudiantes')->insertGetId([
                    'id_usuario' => $studentUserId,
                    'codigo_nie' => $faker->unique()->numerify('##########'),
                    'nombres' => $faker->firstName(),
                    'apellidos' => $lastName,
                    'correo' => "familia{$index}@colegiometodista.test",
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $students[] = $studentId;

                $guardianUserId = $this->createUser($roles['Encargado'], "encargado{$index}", "encargado{$index}@colegiometodista.test");
                $guardianId = DB::table('responsables')->insertGetId([
                    'id_usuario' => $guardianUserId,
                    'nombres' => $faker->firstName(),
                    'apellidos' => $lastName,
                    'dui' => $faker->unique()->numerify('########-#'),
                    'telefono' => $faker->numerify('########'),
                    'correo' => "familia{$index}@colegiometodista.test",
                    'parentesco' => $index % 3 === 0 ? 'Madre' : 'Padre',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $guardians[] = $guardianId;
                DB::table('estudiante_responsable')->insert([
                    'id_estudiante' => $studentId,
                    'id_responsable' => $guardianId,
                    'es_contacto_principal' => true,
                    'created_at' => now(),
                ]);
            }

            foreach ($students as $index => $studentId) {
                $isFemale = $index % 2 === 1;
                DB::table('ficha_estudiante')->insert([
                    'id_estudiante' => $studentId,
                    'fecha_nacimiento' => now()->subYears(8 + ($index % 10))->subDays($index)->toDateString(),
                    'sexo' => $isFemale ? 'F' : 'M',
                    'nacionalidad' => 'Salvadoreña',
                    'tipo_sangre' => $index % 3 === 0 ? 'O+' : 'A+',
                    'repite_grado' => $index % 10 === 0,
                    'anio_grado_anterior' => 2025,
                    'padece_enfermedad' => false,
                    'toma_medicamento' => false,
                    'posee_discapacidad' => false,
                    'alergico_medicamento' => $index % 12 === 0,
                    'nombre_medicamento_alergico' => $index % 12 === 0 ? 'Penicilina' : null,
                    'vacunado_covid' => true,
                    'residencia_estudiante' => 'Casa familiar',
                    'municipio' => 'San Salvador',
                    'departamento' => 'San Salvador',
                    'zona' => 'Urbana',
                    'sexo_responsable' => $isFemale ? 'M' : 'F',
                    'fecha_nacimiento_responsable' => now()->subYears(35 + ($index % 15))->toDateString(),
                    'vive_con_estudiante' => true,
                    'estado_familiar' => 'Casado',
                    'certificado' => true,
                    'boleta_calificaciones' => true,
                    'fotocopia_dui' => true,
                    'numero_partida_nacimiento' => 'PART-' . str_pad((string) $studentId, 6, '0', STR_PAD_LEFT),
                    'folio_partida_nacimiento' => (string) (100 + $index),
                    'tomo_partida_nacimiento' => 'TOMO-' . (1 + ($index % 5)),
                    'libro_partida_nacimiento' => 'LIBRO-' . (1 + ($index % 3)),
                    'carta_pastoral' => $index % 4 !== 0,
                    'nombre_iglesia_asiste' => $index % 4 !== 0 ? 'Iglesia Metodista Central' : null,
                    'nombre_madre' => $isFemale ? 'María' : 'Ana',
                    'dui_madre' => $faker->unique()->numerify('########-#'),
                    'profesion_madre' => 'Comerciante',
                    'telefono_madre' => $faker->numerify('########'),
                    'direccion_madre' => 'San Salvador',
                    'fecha_nacimiento_madre' => now()->subYears(35 + ($index % 15))->toDateString(),
                    'lugar_trabajo_madre' => 'Negocio familiar',
                    'nombre_padre' => $isFemale ? 'Carlos' : 'José',
                    'dui_padre' => $faker->unique()->numerify('########-#'),
                    'profesion_padre' => 'Empleado',
                    'telefono_padre' => $faker->numerify('########'),
                    'direccion_padre' => 'San Salvador',
                    'fecha_nacimiento_padre' => now()->subYears(38 + ($index % 15))->toDateString(),
                    'lugar_trabajo_padre' => 'Empresa privada',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $sections = [];
            foreach ($cycles as $cycleId) {
                foreach ($grades as $gradeId) {
                    foreach (['A', 'B'] as $name) {
                        $sections[] = [
                            'id' => DB::table('secciones')->insertGetId([
                                'id_grado' => $gradeId,
                                'id_ciclo' => $cycleId,
                                'nombre' => $name,
                                'capacidad' => 30,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]),
                            'cycle_id' => $cycleId,
                        ];
                    }
                }
            }

            // ---------------------------------------------------------------
            // $enrollments indexado por [ciclo][sección], para poder saber
            // exactamente qué estudiantes pertenecen a cada sección concreta.
            // ---------------------------------------------------------------
            $enrollments = [];
            foreach ($cycles as $cycleId) {
                foreach (array_slice($students, 0, 50) as $position => $studentId) {
                    $section = $sections[($position % 12) + ($cycleId === $cycles[2026] ? 12 : 0)];
                    $enrollments[$cycleId][$section['id']][$studentId] = DB::table('matriculas')->insertGetId([
                        'id_estudiante' => $studentId,
                        'id_ciclo' => $cycleId,
                        'id_seccion' => $section['id'],
                        'fecha_matricula' => now()->subMonths(2),
                        'estado' => true,
                        'created_at' => now()->subMonths(2),
                        'updated_at' => now()->subMonths(2),
                    ]);
                }
            }

            // ---------------------------------------------------------------
            // Cada asignación de curso guarda también section_id y teacher_id,
            // para poder filtrar $enrollments por sección y armar el horario
            // sin traslapes por docente más abajo.
            // ---------------------------------------------------------------
            $assignments = [];
            foreach ($sections as $sectionIndex => $section) {
                foreach ($subjects as $subjectIndex => $subjectId) {
                    $teacherId = $teachers[($sectionIndex + $subjectIndex) % count($teachers)];
                    $assignments[] = [
                        'id' => DB::table('asignaciones_cursos')->insertGetId([
                            'id_ciclo' => $section['cycle_id'],
                            'id_seccion' => $section['id'],
                            'id_asignatura' => $subjectId,
                            'id_docente' => $teacherId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]),
                        'cycle_id' => $section['cycle_id'],
                        'section_id' => $section['id'],
                        'teacher_id' => $teacherId,
                    ];
                }
            }

            // ---------------------------------------------------------------
            // Franjas horarias disponibles por día. Para cada asignación de
            // curso se busca la primera franja (día + periodo) que el
            // docente de esa asignación todavía no tenga ocupada, evitando
            // así cualquier traslape. Si un docente llegara a llenar todas
            // las franjas de la semana, se lanza una excepción clara en vez
            // de insertar un horario inválido en silencio.
            // ---------------------------------------------------------------
            $days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
            $periods = [
                ['07:30', '08:20'],
                ['08:20', '09:10'],
                ['09:10', '10:00'],
                ['10:20', '11:10'],
                ['11:10', '12:00'],
                ['12:00', '12:50'],
            ];
            // Se indexa también por ciclo: el mismo docente puede repetir el
            // mismo horario semanal en ciclos distintos (años lectivos
            // distintos no compiten por la misma franja real), igual que
            // ahora lo permite el trigger fn_check_horario_solapado.
            $teacherScheduleUsed = []; // [id_ciclo][id_docente][dia_semana][period_index] => true

            foreach ($assignments as $assignment) {
                $sectionEnrollments = $enrollments[$assignment['cycle_id']][$assignment['section_id']] ?? [];
                $teacherId = $assignment['teacher_id'];
                $cycleId = $assignment['cycle_id'];

                $slot = null;
                foreach ($days as $day) {
                    foreach ($periods as $periodIndex => $period) {
                        if (empty($teacherScheduleUsed[$cycleId][$teacherId][$day][$periodIndex])) {
                            $slot = ['day' => $day, 'period' => $period, 'index' => $periodIndex];
                            break 2;
                        }
                    }
                }

                if ($slot === null) {
                    throw new \RuntimeException(
                        "No quedan franjas horarias libres para el docente {$teacherId} en el ciclo {$cycleId}. ".
                        'Agrega más periodos por día o más docentes en el seeder.'
                    );
                }

                $teacherScheduleUsed[$cycleId][$teacherId][$slot['day']][$slot['index']] = true;

                DB::table('horarios')->insert([
                    'id_asignacion_curso' => $assignment['id'],
                    'dia_semana' => $slot['day'],
                    'hora_inicio' => $slot['period'][0],
                    'hora_fin' => $slot['period'][1],
                ]);

                foreach (range(1, 3) as $period) {
                    $evaluationId = DB::table('evaluaciones')->insertGetId([
                        'id_asignacion_curso' => $assignment['id'],
                        'nombre' => "Evaluación {$period}",
                        'ponderacion' => 33.33,
                        'periodo' => $period,
                    ]);
                    foreach ($sectionEnrollments as $enrollmentId) {
                        DB::table('calificaciones')->insert([
                            'id_evaluacion' => $evaluationId,
                            'id_matricula' => $enrollmentId,
                            'nota' => $faker->randomFloat(2, 5, 10),
                        ]);
                    }
                }

                foreach ($sectionEnrollments as $enrollmentId) {
                    foreach (range(1, 3) as $day) {
                        DB::table('asistencias')->insert([
                            'id_matricula' => $enrollmentId,
                            'id_asignacion_curso' => $assignment['id'],
                            'fecha' => now()->subDays($day)->toDateString(),
                            'estado' => $faker->randomElement(['Presente', 'Presente', 'Presente', 'Tardanza', 'Ausente']),
                        ]);
                    }
                }

                DB::table('tareas')->insert([
                    'id_asignacion_curso' => $assignment['id'],
                    'titulo' => $faker->sentence(4),
                    'descripcion' => $faker->paragraph(),
                    'fecha_entrega' => now()->addDays(10),
                    'fecha_publicacion' => now()->subDays(3),
                    'estado' => 'publicada',
                ]);
            }

            $fees = [];
            foreach ($cycles as $cycleId) {
                foreach ([['Matrícula', 150], ['Mensualidad', 85], ['Materiales', 40]] as [$concept, $amount]) {
                    $fees[] = DB::table('aranceles_base')->insertGetId([
                        'id_ciclo' => $cycleId,
                        'nombre_concepto' => $concept,
                        'monto_estandar' => $amount,
                        'dia_vencimiento_mes' => 10,
                        'recargo_mora' => 10,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
            foreach (array_slice($students, 0, 30) as $studentId) {
                $accountId = DB::table('cuentas_por_cobrar')->insertGetId([
                    'id_estudiante' => $studentId,
                    'id_arancel' => $fees[$studentId % count($fees)],
                    'concepto' => 'Mensualidad de septiembre',
                    'monto_original' => 85,
                    'monto_mora' => 0,
                    'saldo_pendiente' => 85,
                    'fecha_emision' => now()->subDays(20)->toDateString(),
                    'fecha_vencimiento' => now()->subDays(5)->toDateString(),
                    'estado' => 'pendiente',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                if ($studentId % 4 === 0) {
                    DB::table('pagos')->insert([
                        'id_cuenta_cobrar' => $accountId,
                        'registrado_por' => $adminUsers[$studentId % count($adminUsers)],
                        'concepto' => 'Abono mensualidad',
                        'monto_pago' => 40,
                        'fecha_pago' => now()->subDays(2)->toDateString(),
                        'numero_comprobante' => 'COMP-' . str_pad((string) $studentId, 6, '0', STR_PAD_LEFT),
                    ]);
                }
            }
            foreach (array_slice($students, 0, 15) as $index => $studentId) {
                DB::table('descuentos_alumnos')->insert([
                    'id_estudiante' => $studentId,
                    'id_arancel' => $fees[$index % count($fees)],
                    'porcentaje_descuento' => 10,
                    'monto_fijo_ajustado' => 76.50,
                    'motivo' => 'Descuento por hermanos matriculados',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            foreach ($students as $index => $studentId) {
                DB::table('demeritos')->insert([
                    'id_estudiante' => $studentId,
                    'registrado_por' => $adminUsers[$index % count($adminUsers)],
                    'motivo' => $faker->randomElement(['Llegada tardía', 'Uniforme incompleto', 'Uso inadecuado del celular']),
                    'estado' => $index % 5 !== 0,
                    'created_at' => now()->subDays($index % 20),
                    'updated_at' => now()->subDays($index % 20),
                ]);
                DB::table('documentos_estudiantes')->insert([
                    'id_estudiante' => $studentId,
                    'subido_por' => $adminUsers[$index % count($adminUsers)],
                    'tipo_documento' => 'Partida de nacimiento',
                    'nombre_archivo' => "partida-{$studentId}.pdf",
                    'ruta_archivo' => "documentos/estudiantes/partida-{$studentId}.pdf",
                ]);
            }

            foreach ($adminUsers as $userId) {
                DB::table('anuncios')->insert([
                    'autor_id' => $userId,
                    'titulo' => $faker->sentence(5),
                    'contenido' => $faker->paragraphs(2, true),
                    'fecha_publicacion' => now()->subDays(2),
                ]);
                DB::table('notificaciones')->insert([
                    'id_usuario_destino' => $userId,
                    'tipo' => 'general',
                    'canal' => 'correo',
                    'asunto' => 'Información del colegio',
                    'contenido' => $faker->sentence(12),
                    'fecha_envio' => now()->toDateString(),
                    'estado_envio' => 'enviado',
                    'created_at' => now(),
                ]);
                DB::table('auditoria')->insert([
                    'id_usuario' => $userId,
                    'id_registro' => $userId,
                    'accion' => 'Crear',
                    'nombre_tabla' => 'usuarios',
                    'valor_anterior' => null,
                    'valor_nuevo' => json_encode(['id' => $userId]),
                    'fecha_creacion' => now(),
                ]);
            }
        });
    }

    private function createUser(int $roleId, string $username, string $email): int
    {
        return DB::table('usuarios')->insertGetId([
            'id_rol' => $roleId,
            'nombre_usuario' => $username,
            'correo' => $email,
            'contrasena' => Hash::make('password'),
            'activo' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}