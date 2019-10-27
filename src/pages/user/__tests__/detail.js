import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp from 'TestApp'
import service, { config } from '../mock'


it('user detail', async () => {
  let wrapper
  config.fetch = true
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/user/1" />
    )
  })
  expect(service.fetch).toHaveBeenCalled()
  const email = wrapper.find('span[data-id="email"]')
  expect(email.text()).toBe('admin@example.com')
})
