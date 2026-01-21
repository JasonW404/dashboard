import { getObjectives } from '@/actions/okr';
import { TodosClient } from './TodosClient';
import { Objective } from '@/types';

export const dynamic = 'force-dynamic';

export default async function TodosPage() {
  const objectives = await getObjectives();

  return (
    <div className="space-y-8">
      <TodosClient initialObjectives={objectives as Objective[]} />
    </div>
  );
}
