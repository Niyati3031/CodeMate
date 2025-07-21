import { supabase } from "../supabase"


export const uploadFile = async (
  file: File
): Promise<string> => {
  if (!file) throw new Error('No file provided')

  const fileExt = file.name.split('.').pop()
  const filePath = `meetings/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('codemate') 
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true
    })

  if (error) {
    console.error('Upload error:', error)
    return ''
  }

  const { data: urlData } = supabase.storage
    .from('codemate')
    .getPublicUrl(filePath)

  return urlData?.publicUrl || ''
}
