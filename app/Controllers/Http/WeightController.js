'use strict'

const axios = require('axios')
const Env = use('Env')

class WeightController {
  async getWeight({ response }) {
    try {
      const authResponse = await axios.post(
        `http://${Env.get('WAREHOUSE_IP')}/agrotopuswms/api/public/login?login=${Env.get('SCALE_USER')}&password=${Env.get('SCALE_PASSWORD')}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      )

      const token = authResponse.data.id
      if (!token) {
        return response.status(500).json({
          error: 'Token não encontrado na resposta da API.'
        })
      }

      const weightUrl = `http://${Env.get('WAREHOUSE_IP')}/agrotopuswms/api/scale-integration/${Env.get('SCALE_ID')}`
      const getWarehouseName = `http://${Env.get('WAREHOUSE_IP')}/agrotopuswms/api/scale/${Env.get('SCALE_ID')}`
      const weightResponse = await axios.get(weightUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      const warehouseName = await axios.get(getWarehouseName, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      return response.json({
        warehouseName: warehouseName.data.warehouse.name.toUpperCase(),
        weight: weightResponse.data.weight || 0,
        stabilized: weightResponse.data.stabilized || false,
        unit: 'kg'
      })
    } catch (error) {
      console.error('Erro na comunicação:', error.response?.data || error.message)
      return response.status(500).json({
        error: 'Erro na comunicação com a balança',
        details: error.response?.data || error.message
      })
    }
  }
}

module.exports = WeightController
