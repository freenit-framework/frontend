import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp from 'TestApp'
// import { data } from 'store/provider'
import service, { config } from '../mock'


it('login', async () => {
  let wrapper
  config.login = true
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/login" />
    )
  })
  const title = wrapper.find('h1')
  expect(title.text()).toEqual('Login')
  const emailInput = wrapper.find('div[data-id="email"] div input')
  const passwordInput = wrapper.find('div[data-id="password"] div input')
  const form = wrapper.find('form')
  const emailEvent = {
    target: {
      value: 'admin@example.com',
    },
  }
  const passwordEvent = {
    target: {
      value: 'Sekrit',
    },
  }
  emailInput.simulate('change', emailEvent)
  passwordInput.simulate('change', passwordEvent)
  await act(async () => {
    form.simulate('submit')
  })
  expect(service.login).toHaveBeenCalledWith(
    emailEvent.target.value,
    passwordEvent.target.value,
  )
})


it('login failure', async () => {
  let wrapper
  config.login = false
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/login" />
    )
  })
  const emailInput = wrapper.find('div[data-id="email"] div input')
  const passwordInput = wrapper.find('div[data-id="password"] div input')
  const form = wrapper.find('form')
  const emailEvent = {
    target: {
      value: 'admin@example.com',
    },
  }
  const passwordEvent = {
    target: {
      value: 'Wrong',
    },
  }
  emailInput.simulate('change', emailEvent)
  passwordInput.simulate('change', passwordEvent)
  await act(async () => {
    form.simulate('submit')
  })
  expect(service.login).toHaveBeenCalledWith(
    emailEvent.target.value,
    passwordEvent.target.value,
  )
})
