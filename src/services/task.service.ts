import type { UpdateAttachmentFormValues, UploadAttachmentFormValues } from '@/features/attachments/validations'
import type { AddTaskCommentFormValues, UpdateTaskCommentFormValues } from '@/features/comments/validations'
import type { AddSubtaskFormValues } from '@/features/subtasks/validations'
import type { UseGetTasksParams } from '@/features/tasks/hooks/use-get-tasks'
import type {
  AddTaskFormValues,
  AddTaskLabelFormValues,
  MoveTaskFormValues,
  UpdateTaskFormValues
} from '@/features/tasks/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { Attachment } from '@/types/attachment.type'
import type { Comment } from '@/types/comment.type'
import type { Subtask } from '@/types/subtask.type'
import type { TaskDetail, TaskMember, TaskRow } from '@/types/task.type'

class TaskService {
  private readonly baseUrl = 'tasks'

  // for table view
  getTasks = async ({
    parentMilestoneId,
    pageIndex,
    pageSize,
    sortBy,
    labelIds,
    milestoneIds,
    endDate,
    startDate,
    isCompleted,
    name,
    memberIds,
    priorities
  }: UseGetTasksParams) => {
    const { data } = await api.get<BasePaginationResponse<TaskRow>>(`/v1/${this.baseUrl}`, {
      params: {
        parentMilestoneId,
        pageIndex,
        pageSize,
        sortBy,
        labelIds,
        milestoneIds,
        endDateFrom: endDate?.[0],
        endDateTo: endDate?.[1],
        startDateFrom: startDate?.[0],
        startDateTo: startDate?.[1],
        isCompleted,
        searchTerm: name,
        memberIds,
        priorities
      }
    })

    return data
  }

  addTask = async ({ body }: { body: AddTaskFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  moveTask = async ({ body }: { body: MoveTaskFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.id}/move`, body)

    return data.value
  }

  getTask = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BaseResponse<TaskDetail>>(`/v1/${this.baseUrl}/${taskId}`)

    return data.value
  }

  deleteTask = async ({ taskId }: { taskId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}`, {
      data: {
        id: taskId
      }
    })

    return data.value
  }

  updateTask = async ({ body }: { body: UpdateTaskFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.id}`, body)

    return data.value
  }

  updateTaskStatus = async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/mark`, { id, isCompleted })

    return data.value
  }

  getComments = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BasePaginationResponse<Comment>>(`/v1/${this.baseUrl}/${taskId}/comments`)

    return data
  }

  addComment = async ({ body }: { body: AddTaskCommentFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/comments`, body)

    return data.value
  }

  updateComment = async ({ body }: { body: UpdateTaskCommentFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.taskId}/comments/${body.commentId}`,
      body
    )

    return data.value
  }

  deleteComment = async ({ commentId, taskId }: { commentId: string; taskId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}/comments/${commentId}`)

    return data.value
  }

  getSubtasks = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BasePaginationResponse<Subtask>>(`/v1/${this.baseUrl}/${taskId}/subtasks`)

    return data
  }

  addSubtask = async ({ body }: { body: AddSubtaskFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/subtasks`, body)

    return data.value
  }

  assignMember = async ({ taskId, userId }: { taskId: string; userId: string }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}/members`, { userId, taskId })

    return data.value
  }

  unassignMember = async ({ id, userId }: { id: string; userId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/members`, {
      data: { id, userId }
    })

    return data.value
  }

  getTaskMembers = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BasePaginationResponse<TaskMember>>(`/v1/${this.baseUrl}/${taskId}/members`)

    return data
  }

  addLabel = async ({ body }: { body: AddTaskLabelFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/labels`, body)

    return data.value
  }

  deleteLabel = async ({ id }: { id: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/labels/${id}`)

    return data.value
  }

  getAttachments = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BasePaginationResponse<Attachment>>(`/v1/${this.baseUrl}/${taskId}/attachments`)

    return data
  }

  uploadAttachment = async ({ body }: { body: UploadAttachmentFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/attachments`, body)

    return data.value
  }

  updateAttachment = async ({ body }: { body: UpdateAttachmentFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.taskId}/attachments/${body.projectResourceId}`,
      body
    )

    return data.value
  }

  deleteAttachment = async ({ id, taskId }: { id: string; taskId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}/attachments/${id}`)

    return data.value
  }
}

const taskService = new TaskService()
export default taskService
