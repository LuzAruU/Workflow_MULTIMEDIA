<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MiembroProyecto extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'miembros_proyecto';
    public $timestamps = false;

    protected $fillable = [
        'proyecto_id',
        'usuario_id',
        'rol'
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

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function proyecto()
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_id');
    }
}
