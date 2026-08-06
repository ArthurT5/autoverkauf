import { RequestWizard } from "@/components/wizard/request-wizard";

export const metadata = {
  title: "New Request — AutoVerkauf",
  description: "Describe the car you're looking for and receive offers from verified Swiss dealers.",
};

export default function NewRequestPage() {
  return <RequestWizard />;
}
