import { localStorageUtils } from './localStorage'
import { sampleMemos } from './sampleMemos'

export const seedSampleData = () => {
  // 기존 데이터가 없을 때만 샘플 데이터 추가
  const existingMemos = localStorageUtils.getMemos()
  if (existingMemos.length === 0) {
    localStorageUtils.saveMemos(sampleMemos)
    console.log('Sample data seeded successfully!')
    return true
  }
  return false
}

export const clearAllData = () => {
  localStorageUtils.clearMemos()
  console.log('All data cleared!')
}

export const resetToSampleData = () => {
  localStorageUtils.saveMemos(sampleMemos)
  console.log('Data reset to sample data!')
}
