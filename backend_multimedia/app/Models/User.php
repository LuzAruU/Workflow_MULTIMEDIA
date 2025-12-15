<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'nombre_completo',
        'email',
        'hash_contrasena',
        'url_avatar',
    ];

    protected $hidden = [
        'hash_contrasena',
    ];

    protected $casts = [
        'creado_en' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function getAuthPassword()
    {
        return $this->hash_contrasena;
    }

    public function proyectos()
    {
        return $this->belongsToMany(Proyecto::class, 'miembros_proyecto', 'usuario_id', 'proyecto_id')
            ->withPivot('rol');
    }
    
    public function authTokens()
    {
        return $this->hasMany(AuthToken::class, 'user_id');
    }
    
    public function createAuthToken()
    {
        // Eliminar tokens expirados
        $this->authTokens()->where('expires_at', '<', now())->delete();
        
        // Crear nuevo token
        $token = hash('sha256', Str::random(60));
        
        $authToken = AuthToken::create([
            'user_id' => $this->id,
            'token' => $token,
            'expires_at' => now()->addDays(30)
        ]);
        
        return $token;
    }
}
