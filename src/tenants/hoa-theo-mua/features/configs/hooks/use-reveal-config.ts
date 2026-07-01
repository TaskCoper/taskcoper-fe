import { useMutation } from '@tanstack/react-query'
import configService from '../services'

export const useRevealConfig = () => {
  const { mutate: revealConfig, isPending: isRevealingConfig } = useMutation({
    mutationFn: configService.revealSecretConfig
  })

  return { revealConfig, isRevealingConfig }
}
