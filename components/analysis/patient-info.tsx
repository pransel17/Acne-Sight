import { useState, useEffect } from "react";

interface Patient {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
}

interface PatientSelectorProps {
  onSelect: (patientId: string) => void;
}

export function PatientSelector({ onSelect }: PatientSelectorProps) {

    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
      fetch("http://localhost:8000/api/patients/") 
        .then((res) => {
          if (!res.ok) throw new Error(`Error ${res.status}: Check backend logs`);
          return res.json();
        })
        .then((data) => {

          if (Array.isArray(data)) {
            setPatients(data);
          } else {
            console.error("API did not return an array:", data);
            setPatients([]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch patients:", err);
          setPatients([]);
        });
    }, []);

  return (
    <div className="mb-4 p-4 bg-card rounded-lg border border-border">
      <label className="block text-sm font-medium mb-2 text-foreground">Target Patient Scan</label>
      <select 
        className="w-full p-2 rounded bg-secondary text-foreground border border-border outline-none focus:ring-2 focus:ring-primary"
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">-- Select Existing Patient --</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.last_name}, {p.first_name} ({p.patient_number})
          </option>
        ))}
      </select>
    </div>
  );
}