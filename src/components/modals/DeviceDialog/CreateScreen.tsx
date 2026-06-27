"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createDrone, createStation } from "@/config/clientApi";

export function CreateScreen({
  type,
  onBack,
  onCreate,
}: {
  type: "drone" | "station";
  onBack: () => void;
  onCreate: (item: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    model: "",
    serialNumber: "",
    ownerId: "david", // В твоем JSON owner - это david, пока захардкодим ID
    maxCapacity: 4,
    lat: 56.95, // Координаты по умолчанию, если создаем станцию
    lng: 24.11,
  });

  const handleSubmit = async () => {
    // Валидация
    if (type === "drone" && (!form.model || !form.serialNumber)) {
      return toast.warning("Model and Serial Number are required");
    }
    if (type === "station" && !form.name) {
      return toast.warning("Station name is required");
    }

    setLoading(true);
    try {
      let result;
      if (type === "drone") {
        result = await createDrone({
          serialNumber: form.serialNumber,
          model: form.model,
          ownerId: form.ownerId,
        });
      } else {
        result = await createStation({
          name: form.name,
          lat: form.lat,
          lng: form.lng,
          maxCapacity: Number(form.maxCapacity),
        });
      }

      toast.success(`${type === "drone" ? "Drone" : "Station"} created successfully`);
      onCreate(result); // Передаем результат обратно в родителя (который обновит стор)
    } catch (error: any) {
      toast.error(error.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-sm text-neutral-300">Fill in the details to register a new {type}</div>
      
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 max-w-[640px]">
          {type === "station" ? (
            <div className="space-y-3">
              <label className="text-xs text-neutral-400">Station Name</label>
              <Input placeholder="e.g. Alpha Station" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-neutral-800/60 border-neutral-700" />
              
              <label className="text-xs text-neutral-400">Max Capacity</label>
              <Input type="number" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} className="bg-neutral-800/60 border-neutral-700" />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs text-neutral-400">Drone Model</label>
              <Input placeholder="e.g. ObjectDelta" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="bg-neutral-800/60 border-neutral-700" />
              
              <label className="text-xs text-neutral-400">Serial Number</label>
              <Input placeholder="Unique SN" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} className="bg-neutral-800/60 border-neutral-700" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
        <Button variant="ghost" onClick={onBack} disabled={loading}>Cancel</Button>
        <Button 
          className="bg-teal-600 rounded text-white min-w-[120px]" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}