import type {Metadata} from 'next';
import PolicyPage from '../ui/PolicyPage';
import {policyBySlug} from '../../lib/legal';
const policy = policyBySlug('trocas-devolucoes-reembolsos');
export const metadata: Metadata = {title: `${policy.title} | MaccoLoco`, description: policy.description};
export default function Page() { return <PolicyPage slug="trocas-devolucoes-reembolsos"/>; }
