<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EntregaTarea extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'entregas_tarea';
    public $timestamps = false;

    protected $fillable = [
        'tarea_id',
        'numero_version',
        'resumen',
        'metodologia'
    ];

    protected $casts = [
        'entregado_en' => 'datetime',
        'numero_version' => 'integer'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
            
            // Auto-incrementar versión
            if (empty($model->numero_version)) {
                $ultimaVersion = self::where('tarea_id', $model->tarea_id)
                    ->max('numero_version');
                $model->numero_version = ($ultimaVersion ?? 0) + 1;
            }
        });
    }

    public function tarea()
    {
        return $this->belongsTo(Tarea::class, 'tarea_id');
    }

    public function revision()
    {
        return $this->hasOne(RevisionQA::class, 'entrega_id');
    }

    public function adjuntos()
    {
        return $this->hasMany(Adjunto::class, 'id_padre')->where('contexto', 'ENTREGA');
    }
}
