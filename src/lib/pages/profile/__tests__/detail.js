import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp from 'TestApp'

it('profile', async () => {
  let wrapper
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/profile" />,
    )
  })
  const email = wrapper.find('input[type="email"]')
  expect(email.instance().value).toBe('admin@example.com')
})
