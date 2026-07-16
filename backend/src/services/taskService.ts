import Task, { ITask } from '../models/Task';

interface TaskQueryFilters {
  projectId?: string;
  status?: string;
  priority?: string;
  search?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const createTask = async (taskData: Partial<ITask>): Promise<ITask> => {
  const task = await Task.create(taskData);
  return task;
};

export const getTasks = async (
  filters: TaskQueryFilters,
  options: PaginationOptions
): Promise<{ tasks: ITask[]; total: number; pages: number }> => {
  const query: any = {};

  if (filters.projectId) query.projectId = filters.projectId;
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;

  if (filters.search) {
    // Fallback to regex if text indexing is slow
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const limit = options.limit || 10;
  const skip = ((options.page || 1) - 1) * limit;

  // Sorting
  let sort: any = { createdAt: -1 };
  if (options.sortBy) {
    const order = options.sortOrder === 'asc' ? 1 : -1;
    sort = { [options.sortBy]: order };
  }

  const total = await Task.countDocuments(query);
  const tasks = await Task.find(query)
    .populate('assignedTo', 'fullName email avatarUrl')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    tasks,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const getTaskById = async (id: string): Promise<ITask | null> => {
  return Task.findById(id).populate('assignedTo', 'fullName email avatarUrl');
};

export const updateTask = async (id: string, updateData: Partial<ITask>): Promise<ITask | null> => {
  return Task.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate(
    'assignedTo',
    'fullName email avatarUrl'
  );
};

export const deleteTask = async (id: string): Promise<ITask | null> => {
  return Task.findByIdAndDelete(id);
};
