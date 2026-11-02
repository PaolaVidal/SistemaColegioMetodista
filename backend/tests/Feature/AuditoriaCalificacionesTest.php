<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;

class AuditoriaCalificacionesTest extends SeguridadTestCase
{
    public function test_crud_records_actor_before_after_and_noop_does_not_duplicate(): void
    {
        $grupo = $this->grupo();
        $admin = $this->usuario();
        Sanctum::actingAs($admin);
        $id = $this->postJson('/api/calificaciones', [
            'id_evaluacion' => $grupo['evaluacion'], 'id_matricula' => $grupo['matricula'], 'nota' => 8,
        ])->assertCreated()->json('id');
        $this->patchJson("/api/calificaciones/$id", ['nota' => 9])->assertOk();
        $this->patchJson("/api/calificaciones/$id", ['nota' => 9])->assertOk();
        $this->deleteJson("/api/calificaciones/$id")->assertNoContent();
        $filas = DB::table('auditoria')->where('nombre_tabla', 'calificaciones')->where('id_registro', $id)->orderBy('id')->get();
        $this->assertSame(['Crear', 'Actualizar', 'Eliminar'], $filas->pluck('accion')->all());
        foreach ($filas as $fila) {
            $this->assertSame($admin->id, $fila->id_usuario);
            $this->assertSame('api', $fila->origen);
            $this->assertNotNull($fila->usuario_bd);
        }
        $this->assertEquals(8, json_decode($filas[1]->valor_anterior)->nota);
        $this->assertEquals(9, json_decode($filas[1]->valor_nuevo)->nota);
        $this->getJson('/api/auditoria/'.$filas[1]->id)->assertOk()->assertJsonPath('valor_nuevo.nota', 9);
    }

    public function test_batch_grades_are_audited_and_failed_transactions_leave_no_history(): void
    {
        $grupo = $this->grupo();
        $admin = $this->usuario();
        Sanctum::actingAs($admin);
        $url = '/api/evaluaciones/'.$grupo['evaluacion'].'/calificaciones';
        $this->putJson($url, ['calificaciones' => [['id_matricula' => $grupo['matricula'], 'nota' => 8]]])->assertOk();
        $this->putJson($url, ['calificaciones' => [['id_matricula' => $grupo['matricula'], 'nota' => 9]]])->assertOk();
        $this->assertSame(2, DB::table('auditoria')->where('id_usuario', $admin->id)->count());
        $antes = DB::table('auditoria')->count();
        try {
            DB::transaction(function () use ($grupo) {
                DB::table('calificaciones')->where('id_matricula', $grupo['matricula'])->update(['nota' => 7]);
                throw new \RuntimeException('Revertir prueba');
            });
        } catch (\RuntimeException $e) {
            $this->assertSame('Revertir prueba', $e->getMessage());
        }
        $this->assertSame($antes, DB::table('auditoria')->count());
        $this->assertEquals(9, DB::table('calificaciones')->where('id_matricula', $grupo['matricula'])->value('nota'));
    }

    public function test_sql_changes_are_recorded_and_audit_cannot_be_forged_or_modified(): void
    {
        $grupo = $this->grupo();
        $id = DB::table('calificaciones')->insertGetId(['id_evaluacion' => $grupo['evaluacion'], 'id_matricula' => $grupo['matricula'], 'nota' => 8]);
        DB::table('calificaciones')->where('id', $id)->update(['nota' => 9]);
        DB::table('calificaciones')->where('id', $id)->delete();
        $fila = DB::table('auditoria')->where('id_registro', $id)->where('nombre_tabla', 'calificaciones')->first();
        $this->assertNull($fila->id_usuario);
        $this->assertSame('sql', $fila->origen);
        $this->assertSame(3, DB::table('auditoria')->where('id_registro', $id)->count());

        foreach ([
            "UPDATE auditoria SET accion='Eliminar' WHERE id=$fila->id",
            "DELETE FROM auditoria WHERE id=$fila->id",
            'TRUNCATE auditoria',
            'TRUNCATE calificaciones',
            "INSERT INTO auditoria (id_registro, accion, nombre_tabla) VALUES (1, 'Crear', 'calificaciones')",
        ] as $sql) {
            try {
                DB::transaction(fn () => DB::statement($sql));
                $this->fail('La base aceptó una operación prohibida: '.$sql);
            } catch (QueryException $e) {
                $this->assertSame('42501', $e->errorInfo[0]);
            }
        }
        Sanctum::actingAs($this->usuario());
        $this->postJson('/api/auditoria', [])->assertStatus(405);
        $this->patchJson('/api/auditoria/'.$fila->id, [])->assertStatus(405);
        $this->deleteJson('/api/auditoria/'.$fila->id)->assertStatus(405);
    }

    public function test_role_middleware_and_row_scope_prevent_unauthorized_grade_changes(): void
    {
        $grupo = $this->grupo();
        $ajeno = $this->grupo();
        $id = DB::table('calificaciones')->insertGetId(['id_evaluacion' => $ajeno['evaluacion'], 'id_matricula' => $ajeno['matricula'], 'nota' => 8]);
        Sanctum::actingAs($grupo['docente']);
        $this->getJson('/api/usuarios')->assertForbidden();
        $this->getJson('/api/auditoria')->assertForbidden();
        $this->getJson('/api/calificaciones')->assertOk()->assertJsonPath('total', 0);
        $this->patchJson('/api/calificaciones/'.$id, ['nota' => 10])->assertNotFound();
        $this->postJson('/api/calificaciones', ['id_evaluacion' => $ajeno['evaluacion'], 'id_matricula' => $ajeno['matricula'], 'nota' => 10])->assertForbidden();
        Sanctum::actingAs($this->usuario('Secretaría'));
        $this->getJson('/api/calificaciones')->assertOk();
        $this->patchJson('/api/calificaciones/'.$id, ['nota' => 10])->assertForbidden();
        Sanctum::actingAs($grupo['estudiante']);
        $this->getJson('/api/calificaciones')->assertOk()->assertJsonPath('total', 0);
        $this->postJson('/api/calificaciones', [])->assertForbidden();
        $this->assertEquals(8, DB::table('calificaciones')->where('id', $id)->value('nota'));
    }
}
