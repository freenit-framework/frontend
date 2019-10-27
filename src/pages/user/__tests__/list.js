import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp from 'TestApp'
import service, { config } from '../mock'


it('user list', async () => {
  let wrapper
  config.fetchAll = true
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/users" />
    )
  })
  expect(service.fetchAll).toHaveBeenCalled()
  const page = wrapper.find('div[data-id="page"]')
  expect(page.text()).toBe("0")
})
