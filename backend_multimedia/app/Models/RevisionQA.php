<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RevisionQA extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'revisiones_qa';
    public $timestamps = false;

    protected $fillable = [
        'entrega_id',
        'revisor_id',
        'veredicto',
        'texto_retroalimentacion'
    ];

    protected $casts = [
        'revisado_en' => 'datetime'
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

    public function entrega()
    {
        return $this->belongsTo(EntregaTarea::class, 'entrega_id');
    }

    public function revisor()
    {
        return $this->belongsTo(User::class, 'revisor_id');
    }

    public function adjuntos()
    {
        return $this->hasMany(Adjunto::class, 'id_padre')->where('contexto', 'REVISION');
    }
}
