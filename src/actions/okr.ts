'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- Objectives ---

export async function getObjectives() {
    try {
        const objectives = await prisma.objective.findMany({
            where: { deletedAt: null },
            include: {
                keyResults: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return objectives;
    } catch (error) {
        console.error('Failed to fetch objectives:', error);
        return [];
    }
}

export async function createObjective(title: string, deadline?: Date | null) {
    try {
        const objective = await prisma.objective.create({
            data: { title, deadline },
        });
        revalidatePath('/todos');
        return objective;
    } catch (error) {
        console.error('Failed to create objective:', error);
        throw new Error('Failed to create objective');
    }
}

export async function updateObjective(id: string, data: { title?: string; why?: string; how?: string; what?: string; deadline?: Date | null }) {
    try {
        const objective = await prisma.objective.update({
            where: { id },
            data,
        });
        revalidatePath('/todos');
        return objective;
    } catch (error) {
        console.error('Failed to update objective:', error);
        throw new Error('Failed to update objective');
    }
}

export async function toggleObjective(id: string) {
    try {
        const obj = await prisma.objective.findUnique({ where: { id } });
        if (!obj) throw new Error('Objective not found');

        const updated = await prisma.objective.update({
            where: { id },
            data: { completed: !obj.completed },
        });
        revalidatePath('/todos');
        return updated;
    } catch (error) {
        console.error('Failed to toggle objective:', error);
        throw new Error('Failed to toggle objective');
    }
}

export async function deleteObjective(id: string) {
    try {
        await prisma.objective.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        revalidatePath('/todos');
    } catch (error) {
        console.error('Failed to delete objective:', error);
        throw new Error('Failed to delete objective');
    }
}

// --- Key Results ---

export async function createKeyResult(objectiveId: string, title: string, priority: 'low' | 'medium' | 'high' = 'medium', deadline?: Date) {
    try {
        const kr = await prisma.keyResult.create({
            data: {
                title,
                objectiveId,
                priority,
                deadline,
            },
        });
        revalidatePath('/todos');
        return kr;
    } catch (error) {
        console.error('Failed to create key result:', error);
        throw new Error('Failed to create key result');
    }
}

export async function updateKeyResult(
    id: string,
    data: {
        title?: string;
        why?: string;
        how?: string;
        what?: string;
        priority?: 'low' | 'medium' | 'high';
        deadline?: Date | null;
    }
) {
    try {
        const kr = await prisma.keyResult.update({
            where: { id },
            data,
        });
        revalidatePath('/todos');
        return kr;
    } catch (error) {
        console.error('Failed to update key result:', error);
        throw new Error('Failed to update key result');
    }
}

export async function toggleKeyResult(id: string) {
    try {
        const kr = await prisma.keyResult.findUnique({ where: { id } });
        if (!kr) throw new Error('KeyResult not found');

        const updated = await prisma.keyResult.update({
            where: { id },
            data: { completed: !kr.completed },
        });
        revalidatePath('/todos');
        return updated;
    } catch (error) {
        console.error('Failed to toggle key result:', error);
        throw new Error('Failed to toggle key result');
    }
}

export async function deleteKeyResult(id: string) {
    try {
        await prisma.keyResult.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        revalidatePath('/todos');
    } catch (error) {
        console.error('Failed to delete key result:', error);
        throw new Error('Failed to delete key result');
    }
}
