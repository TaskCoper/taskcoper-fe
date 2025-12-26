import type { GetMyProjectsParams } from '@/features/projects/hooks/use-get-my-projects'
import type { CreateProjectFormValues } from '@/features/projects/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { ProjectPreview } from '@/types/project.type'

class ProjectService {
  private readonly baseUrl = '/projects'

  getMyProjects = async ({ userId, status, searchTerm, pageIndex, pageSize }: GetMyProjectsParams) => {
    const { data } = await api.get<BasePaginationResponse<ProjectPreview>>(`${this.baseUrl}/user`, {
      params: {
        userId,
        status,
        searchTerm,
        pageIndex,
        pageSize
      }
    })

    return data
  }

  createProject = async ({ body }: { body: CreateProjectFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`${this.baseUrl}`, body)

    return data.value
  }
}

const projectService = new ProjectService()
export default projectService
