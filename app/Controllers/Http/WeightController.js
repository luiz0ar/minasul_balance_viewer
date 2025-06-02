'use strict'

const axios = require('axios')
const Env = use('Env')

class WeightController {
  async getWeight({ response }) {
    try {
      const username = Env.get('BALANCA_USER')
      const password = Env.get('BALANCA_PASSWORD')
      const authResponse = await axios.post(
        `http://10.1.30.200:8080/agrotopuswms/api/public/login?login=${username}&password=${password}`,
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

      const weightUrl = 'http://minasulelm.fortiddns.com:8080/agrotopuswms/api/scale-integration/8bcea492-8d36-4f09-860f-6a6e7acad27a'
      const weightResponse = await axios.get(weightUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      console.log(weightResponse)
      return response.json({
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
