<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Proyecto;
use App\Models\MiembroProyecto;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        echo "Creando usuarios...\n";
        
        // Crear usuarios
        $user1 = User::create([
            'id' => (string) Str::uuid(),
            'nombre_completo' => 'Juan Pérez',
            'email' => 'juan@veriflow.com',
            'hash_contrasena' => Hash::make('password'),
            'url_avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
        ]);
        
        echo "Usuario creado: {$user1->nombre_completo} ({$user1->id})\n";

        $user2 = User::create([
            'id' => (string) Str::uuid(),
            'nombre_completo' => 'María García',
            'email' => 'maria@veriflow.com',
            'hash_contrasena' => Hash::make('password'),
            'url_avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
        ]);
        
        echo "Usuario creado: {$user2->nombre_completo} ({$user2->id})\n";

        $user3 = User::create([
            'id' => (string) Str::uuid(),
            'nombre_completo' => 'Carlos López',
            'email' => 'carlos@veriflow.com',
            'hash_contrasena' => Hash::make('password'),
            'url_avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
        ]);
        
        echo "Usuario creado: {$user3->nombre_completo} ({$user3->id})\n";

        echo "\nCreando proyectos...\n";

        // Crear proyectos
        $proyecto1 = Proyecto::create([
            'nombre' => 'Migración Base de Datos',
            'descripcion' => 'Migrar base de datos heredada a PostgreSQL',
            'estado' => 'EN PROGRESO',
        ]);
        
        echo "Proyecto creado: {$proyecto1->nombre}\n";

        MiembroProyecto::create([
            'proyecto_id' => $proyecto1->id,
            'usuario_id' => $user1->id,
            'rol' => 'ORGANIZADOR',
        ]);

        MiembroProyecto::create([
            'proyecto_id' => $proyecto1->id,
            'usuario_id' => $user2->id,
            'rol' => 'EJECUTOR',
        ]);

        MiembroProyecto::create([
            'proyecto_id' => $proyecto1->id,
            'usuario_id' => $user3->id,
            'rol' => 'REVISOR',
        ]);

        $proyecto2 = Proyecto::create([
            'nombre' => 'Sistema de Autenticación',
            'descripcion' => 'Implementar OAuth 2.0 y autenticación multifactor',
            'estado' => 'ABIERTO',
        ]);
        
        echo "Proyecto creado: {$proyecto2->nombre}\n";

        MiembroProyecto::create([
            'proyecto_id' => $proyecto2->id,
            'usuario_id' => $user1->id,
            'rol' => 'ORGANIZADOR',
        ]);

        MiembroProyecto::create([
            'proyecto_id' => $proyecto2->id,
            'usuario_id' => $user2->id,
            'rol' => 'EJECUTOR',
        ]);
        
        echo "\nSeeder completado exitosamente!\n";
        echo "Total usuarios: " . User::count() . "\n";
        echo "Total proyectos: " . Proyecto::count() . "\n";
    }
}
