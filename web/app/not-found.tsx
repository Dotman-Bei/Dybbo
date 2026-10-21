import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

export default function NotFound() {
  return (
    <AppFrame>
      <div className="title-row">
        <div>
          <h1>No Chog lives here</h1>
          <p className="sub">Chog Genesis runs from #1 to #1,969, and this page isn&rsquo;t one of Dybbo&rsquo;s.</p>
        </div>
        <div className="title-row__actions">
          <Link className="btn btn--primary" href="/chogs">Browse the Chogs</Link>
        </div>
      </div>
    </AppFrame>
  );
}
