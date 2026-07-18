import { listPatients } from "@/lib/data/patients";
import { PatientsClient } from "@/components/app/patients-client";

export default async function PatientsPage() {
  const patients = await listPatients();
  return <PatientsClient patients={patients} />;
}
