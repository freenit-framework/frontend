import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp from 'TestApp'
import service, { config } from '../mock'
import userService from 'pages/user/mock'


it('role detail', async () => {
  let wrapper
  const props = {
    path: '/role/1',
  }
  config.fetch = true
  await act(async () => {
    wrapper = await mount(
      <TestApp {...props} />
    )
  })
  expect(service.fetch).toHaveBeenCalled()
  const h1 = wrapper.find('h1')
  expect(h1.text()).toBe('role')
  expect(userService.fetchAll).toHaveBeenCalled()
})
