export interface StorageDevice {
  id: number
  name: string
  code: string
  type: string
  status: string
  differentiateSampleType: boolean
  sampleType: string
  rackCount: number
  rackLayers: number
  boxesPerLayer: number
  boxSpec: string
  totalCapacity: number
  occupied: number
  free: number
}

export interface BoxItem {
  occupied: boolean
}

// 生成设备数据 - 每种类型20台，共100台
const sampleTypes = ['组织样本', '血液样本', '胸水样本', '骨髓样本', '尿液样本', '粪便样本']

function generateRandomOccupied(total: number): number {
  const min = Math.floor(total * 0.2)
  const max = Math.floor(total * 0.8)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateDevices(): StorageDevice[] {
  const devices: StorageDevice[] = []
  let nextId = 1

  // 冰箱 x 20
  for (let i = 1; i <= 20; i++) {
    const rackCount = Math.floor(Math.random() * 10) + 2 // 2-11
    const rackLayers = Math.floor(Math.random() * 10) + 2 // 2-11
    const boxesPerLayer = Math.floor(Math.random() * 10) + 2 // 2-11
    const total = rackCount * rackLayers * boxesPerLayer
    const occupied = generateRandomOccupied(total)
    const diffType = Math.random() > 0.5
    devices.push({
      id: nextId++,
      name: `冰箱${String.fromCharCode(64 + i)}`,
      code: `FRIDGE-4C-${String(i).padStart(3, '0')}`,
      type: '冰箱',
      status: Math.random() > 0.2 ? '使用中' : '已停用',
      differentiateSampleType: diffType,
      sampleType: diffType ? sampleTypes[Math.floor(Math.random() * sampleTypes.length)] : '',
      rackCount,
      rackLayers,
      boxesPerLayer,
      boxSpec: '9*9',
      totalCapacity: total,
      occupied,
      free: total - occupied
    })
  }

  // 超低温冰箱 x 20
  for (let i = 1; i <= 20; i++) {
    const rackCount = Math.floor(Math.random() * 10) + 2
    const rackLayers = Math.floor(Math.random() * 10) + 2
    const boxesPerLayer = Math.floor(Math.random() * 10) + 2
    const total = rackCount * rackLayers * boxesPerLayer
    const occupied = generateRandomOccupied(total)
    const diffType = Math.random() > 0.3
    devices.push({
      id: nextId++,
      name: `超低温冰箱${i}`,
      code: `ULT-80C-${String(i).padStart(3, '0')}`,
      type: '超低温冰箱',
      status: Math.random() > 0.2 ? '使用中' : '已停用',
      differentiateSampleType: diffType,
      sampleType: diffType ? sampleTypes[Math.floor(Math.random() * sampleTypes.length)] : '',
      rackCount,
      rackLayers,
      boxesPerLayer,
      boxSpec: '9*9',
      totalCapacity: total,
      occupied,
      free: total - occupied
    })
  }

  // 液氮罐 x 20
  for (let i = 1; i <= 20; i++) {
    const rackCount = Math.floor(Math.random() * 10) + 2
    const rackLayers = Math.floor(Math.random() * 10) + 2
    const boxesPerLayer = Math.floor(Math.random() * 10) + 2
    const total = rackCount * rackLayers * boxesPerLayer
    const occupied = generateRandomOccupied(total)
    const diffType = Math.random() > 0.3
    devices.push({
      id: nextId++,
      name: `液氮罐${i}`,
      code: `LN2-196C-${String(i).padStart(3, '0')}`,
      type: '液氮罐',
      status: Math.random() > 0.2 ? '使用中' : '已停用',
      differentiateSampleType: diffType,
      sampleType: diffType ? sampleTypes[Math.floor(Math.random() * sampleTypes.length)] : '',
      rackCount,
      rackLayers,
      boxesPerLayer,
      boxSpec: '5*5',
      totalCapacity: total,
      occupied,
      free: total - occupied
    })
  }

  // 冷藏柜 x 20
  for (let i = 1; i <= 20; i++) {
    const rackCount = Math.floor(Math.random() * 10) + 2
    const rackLayers = Math.floor(Math.random() * 10) + 2
    const boxesPerLayer = Math.floor(Math.random() * 10) + 2
    const total = rackCount * rackLayers * boxesPerLayer
    const occupied = generateRandomOccupied(total)
    const diffType = Math.random() > 0.5
    devices.push({
      id: nextId++,
      name: `冷藏柜${String.fromCharCode(64 + i)}`,
      code: `COOLER-4C-${String(i).padStart(3, '0')}`,
      type: '冷藏柜',
      status: Math.random() > 0.2 ? '使用中' : '已停用',
      differentiateSampleType: diffType,
      sampleType: diffType ? sampleTypes[Math.floor(Math.random() * sampleTypes.length)] : '',
      rackCount,
      rackLayers,
      boxesPerLayer,
      boxSpec: '9*9',
      totalCapacity: total,
      occupied,
      free: total - occupied
    })
  }

  // 冷冻柜 x 20
  for (let i = 1; i <= 20; i++) {
    const rackCount = Math.floor(Math.random() * 10) + 2
    const rackLayers = Math.floor(Math.random() * 10) + 2
    const boxesPerLayer = Math.floor(Math.random() * 10) + 2
    const total = rackCount * rackLayers * boxesPerLayer
    const occupied = generateRandomOccupied(total)
    const diffType = Math.random() > 0.4
    devices.push({
      id: nextId++,
      name: `冷冻柜${String.fromCharCode(64 + i)}`,
      code: `FREEZER-20C-${String(i).padStart(3, '0')}`,
      type: '冷冻柜',
      status: Math.random() > 0.2 ? '使用中' : '已停用',
      differentiateSampleType: diffType,
      sampleType: diffType ? sampleTypes[Math.floor(Math.random() * sampleTypes.length)] : '',
      rackCount,
      rackLayers,
      boxesPerLayer,
      boxSpec: '5*5',
      totalCapacity: total,
      occupied,
      free: total - occupied
    })
  }

  return devices
}

export const mockDevices: StorageDevice[] = generateDevices()

export function getDeviceById(id: number): StorageDevice | undefined {
  return mockDevices.find((d) => d.id === id)
}