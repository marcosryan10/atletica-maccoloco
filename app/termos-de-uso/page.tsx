import type {Metadata} from 'next';
import PolicyPage from '../ui/PolicyPage';
import {policyBySlug} from '../../lib/legal';
const policy = policyBySlug('termos-de-uso');
export const metadata: Metadata = {title: `${policy.title} | MaccoLoco`, description: policy.description};
export default function Page() { return <PolicyPage slug="termos-de-uso"/>; }
