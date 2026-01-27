import React, { useEffect, useState, useRef } from 'react';
import { useTaskStore } from '../stores/useTaskStore';
import { EisenhowerQuadrant, type Task } from '@studyos/core';
import clsx from 'clsx';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    type DragStartEvent,
    type DragEndEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';

// --- Sortable Task Item ---
interface SortableTaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, task: Task) => void;
}

const SortableTaskItem = ({ task, onToggle, onDelete, onContextMenu }: SortableTaskItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onContextMenu={(e) => onContextMenu(e, task)}
            className="flex items-start justify-between bg-black/10 hover:bg-black/20 dark:bg-black/20 dark:hover:bg-black/30 p-2 rounded transition group touch-none select-none my-1"
        >
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={task.status === 'COMPLETED'}
                    onChange={(e) => {
                        e.stopPropagation(); // Prevent drag start
                        onToggle(task.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                    className="cursor-pointer"
                />
                <div className="flex flex-col">
                    <span className={clsx("text-primary", task.status === 'COMPLETED' && "line-through opacity-50")}>
                        {task.title}
                    </span>
                    {task.reminderTime && (
                        <span className="text-[10px] text-accent flex items-center gap-1">
                            ⏰ {format(task.reminderTime, 'MMM d, h:mm a')}
                        </span>
                    )}
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="text-red-400 opacity-0 group-hover:opacity-100 transition text-xs px-2"
            >
                Delete
            </button>
        </div>
    );
};

// --- Droppable Quadrant ---
const Quadrant: React.FC<{
    title: string;
    tasks: Task[];
    quadrant: EisenhowerQuadrant;
    colorClass: string;
    onContextMenu: (e: React.MouseEvent, task: Task) => void;
}> = ({ title, tasks, quadrant, colorClass, onContextMenu }) => {
    const { setNodeRef } = useDroppable({
        id: quadrant,
    });

    const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
    const deleteTask = useTaskStore((state) => state.deleteTask);

    return (
        <div ref={setNodeRef} className={clsx("flex flex-col h-full border rounded-lg p-4 bg-secondary", colorClass)}>
            <h3 className="font-bold mb-3 text-lg opacity-90 text-primary">{title}</h3>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[100px]">
                {tasks.length === 0 && <p className="text-sm opacity-50 italic text-primary-muted text-center py-4">Drop tasks here</p>}

                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <SortableTaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTaskCompletion}
                            onDelete={deleteTask}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

// --- Context Menu Component ---
const ContextMenu: React.FC<{
    position: { x: number; y: number } | null;
    task: Task | null;
    onClose: () => void;
}> = ({ position, task, onClose }) => {
    const moveTask = useTaskStore((state) => state.moveTask);
    const updateTask = useTaskStore((state) => state.updateTask);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (!position || !task) return null;

    const handleMoveTo = (quadrant: EisenhowerQuadrant) => {
        moveTask(task.id, quadrant, 0);
        onClose();
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        if (!dateStr) return; // cleared
        const newTime = new Date(dateStr).getTime();
        updateTask(task.id, { reminderTime: newTime });
        // Don't close immediately to allow user to see change? Or close?
        // Let's close after a small delay or immediately.
        onClose();
    };

    return (
        <div
            ref={contextMenuRef}
            className="fixed z-50 bg-secondary border border-border rounded shadow-lg p-2 min-w-[200px]"
            style={{ top: position.y, left: position.x }}
        >
            <div className="text-xs text-primary-muted px-2 py-1 mb-2 border-b border-border font-bold truncate max-w-[200px]">
                {task.title}
            </div>

            {/* Date Picker */}
            <div className="px-2 py-1 mb-2">
                <label className="text-[10px] text-primary-muted block mb-1">Due Date</label>
                <input
                    type="datetime-local"
                    className="w-full bg-tertiary text-primary text-xs rounded p-1 border border-border"
                    defaultValue={task.reminderTime ? new Date(task.reminderTime - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                    onChange={handleDateChange}
                />
            </div>

            <div className="border-t border-border my-1"></div>

            {/* Move To Submenu (Simple replacement for now, expand if needed) */}
            <div className="px-2 py-1">
                <div className="text-[10px] text-primary-muted mb-1">Move To...</div>
                <div className="flex flex-col gap-1">
                    <button className="text-left text-xs hover:bg-tertiary px-2 py-1 rounded text-primary" onClick={() => handleMoveTo(EisenhowerQuadrant.Q1_URGENT_IMPORTANT)}>Q1: Urgent & Important</button>
                    <button className="text-left text-xs hover:bg-tertiary px-2 py-1 rounded text-primary" onClick={() => handleMoveTo(EisenhowerQuadrant.Q2_NOT_URGENT_IMPORTANT)}>Q2: Important, Not Urgent</button>
                    <button className="text-left text-xs hover:bg-tertiary px-2 py-1 rounded text-primary" onClick={() => handleMoveTo(EisenhowerQuadrant.Q3_URGENT_NOT_IMPORTANT)}>Q3: Urgent, Not Important</button>
                    <button className="text-left text-xs hover:bg-tertiary px-2 py-1 rounded text-primary" onClick={() => handleMoveTo(EisenhowerQuadrant.Q4_NOT_URGENT_NOT_IMPORTANT)}>Q4: Delete/Eliminate</button>
                    <button className="text-left text-xs hover:bg-tertiary px-2 py-1 rounded text-primary text-red-400" onClick={() => handleMoveTo(EisenhowerQuadrant.UNSORTED)}>Task Dump</button>
                </div>
            </div>
        </div>
    );
};


export const TaskMatrix: React.FC = () => {
    const { tasks, fetchTasks, moveTask } = useTaskStore();
    const [showCompleted, setShowCompleted] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ position: { x: number; y: number }; task: Task } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { // Use PointerSensor effectively for both mouse and touch if configured right, or add TouchSensor explicitly.
            // PointerSensor with constraint is usually better for scrolling.
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const getTasksByQuadrant = (q: EisenhowerQuadrant) => {
        return tasks
            .filter((t) => {
                if (t.quadrant !== q) return false;
                if (!showCompleted && t.status === 'COMPLETED') return false;
                return true;
            })
            // Use fallback sortOrder or index preservation
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    };

    const handleContextMenu = (e: React.MouseEvent, task: Task) => {
        e.preventDefault();
        setContextMenu({
            position: { x: e.clientX, y: e.clientY },
            task: task
        });
    };

    // --- Drag Handlers ---
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = () => {
        // Optional: Add visual feedback logic here if needed beyond default sortable
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeCurrentId = active.id as string;
        const overId = over.id as string;

        // Find the active task
        const activeTask = tasks.find(t => t.id === activeCurrentId);
        if (!activeTask) return;

        // Determine Drop Target
        let newQuadrant: EisenhowerQuadrant | undefined;
        let newIndex: number | undefined;

        // Case 1: Dropped over a Quadrant container directly (usually when empty)
        if (Object.values(EisenhowerQuadrant).includes(overId as EisenhowerQuadrant)) {
            newQuadrant = overId as EisenhowerQuadrant;
            newIndex = getTasksByQuadrant(newQuadrant).length; // Append to end
        }
        // Case 2: Dropped over another Task
        else {
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newQuadrant = overTask.quadrant;
                const targetTasks = getTasksByQuadrant(newQuadrant);
                const overIndex = targetTasks.findIndex(t => t.id === overId);
                newIndex = overIndex;
            }
        }

        if (newQuadrant) {
            // Only move if changed position or quadrant
            if (activeTask.quadrant !== newQuadrant || activeTask.id !== overId) {
                moveTask(activeCurrentId, newQuadrant, newIndex || 0);
            }
        }
    };

    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-full w-full gap-4">
                <div className="flex justify-end px-2">
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={showCompleted}
                            onChange={(e) => setShowCompleted(e.target.checked)}
                            className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-offset-gray-900"
                        />
                        Show Completed
                    </label>
                </div>

                <div className="flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 gap-4 flex-1 min-h-[500px]">
                    <Quadrant
                        title="Urgent & Important (Do)"
                        quadrant={EisenhowerQuadrant.Q1_URGENT_IMPORTANT}
                        tasks={getTasksByQuadrant(EisenhowerQuadrant.Q1_URGENT_IMPORTANT)}
                        colorClass="border-red-500/50 bg-red-500/5"
                        onContextMenu={handleContextMenu}
                    />
                    <Quadrant
                        title="Not Urgent & Important (Schedule)"
                        quadrant={EisenhowerQuadrant.Q2_NOT_URGENT_IMPORTANT}
                        tasks={getTasksByQuadrant(EisenhowerQuadrant.Q2_NOT_URGENT_IMPORTANT)}
                        colorClass="border-blue-500/50 bg-blue-500/5"
                        onContextMenu={handleContextMenu}
                    />
                    <Quadrant
                        title="Urgent & Not Important (Delegate)"
                        quadrant={EisenhowerQuadrant.Q3_URGENT_NOT_IMPORTANT}
                        tasks={getTasksByQuadrant(EisenhowerQuadrant.Q3_URGENT_NOT_IMPORTANT)}
                        colorClass="border-yellow-500/50 bg-yellow-500/5"
                        onContextMenu={handleContextMenu}
                    />
                    <Quadrant
                        title="Not Urgent & Not Important (Eliminate)"
                        quadrant={EisenhowerQuadrant.Q4_NOT_URGENT_NOT_IMPORTANT}
                        tasks={getTasksByQuadrant(EisenhowerQuadrant.Q4_NOT_URGENT_NOT_IMPORTANT)}
                        colorClass="border-green-500/50 bg-green-500/5"
                        onContextMenu={handleContextMenu}
                    />
                </div>

                {/* Unsorted / Task Dump Area */}
                <div className="mt-4 border-t border-border pt-4">
                    <h3 className="font-bold mb-3 text-lg opacity-90 text-primary">Task Dump (Unsorted)</h3>
                    <div className="bg-secondary/50 rounded-lg p-4 min-h-[100px] border border-border border-dashed">
                        <Quadrant
                            title=""
                            quadrant={EisenhowerQuadrant.UNSORTED}
                            tasks={getTasksByQuadrant(EisenhowerQuadrant.UNSORTED)}
                            colorClass="bg-transparent border-none"
                            onContextMenu={handleContextMenu}
                        />
                    </div>
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="bg-secondary p-2 rounded shadow-xl border border-accent/50 w-[300px] opacity-90 cursor-grabbing">
                            {activeTask.title}
                        </div>
                    ) : null}
                </DragOverlay>

                {/* Context Menu */}
                {contextMenu && (
                    <ContextMenu
                        position={contextMenu.position}
                        task={contextMenu.task}
                        onClose={() => setContextMenu(null)}
                    />
                )}
            </div>
        </DndContext>
    );
};
