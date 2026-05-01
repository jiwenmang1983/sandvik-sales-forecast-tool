/**
 * 邮件发送工具 — 使用 nodemailer
 *
 * 配置方式：
 * 在项目根目录或环境变量中设置 SMTP 配置
 *
 * 环境变量：
 *   SMTP_HOST     — SMTP 服务器地址
 *   SMTP_PORT     — SMTP 端口（默认 587）
 *   SMTP_SECURE   — 是否使用 SSL（默认 false）
 *   SMTP_USER     — 发件人邮箱
 *   SMTP_PASS     — 邮箱密码/授权码
 *   SMTP_FROM     — 发件人显示名称（默认使用 SMTP_USER）
 */

import nodemailer from 'nodemailer'

// ==================== 配置 ====================

const CONFIG = {
  host: import.meta.env.SMTP_HOST || 'smtp.q.com',
  port: parseInt(import.meta.env.SMTP_PORT || '587'),
  secure: import.meta.env.SMTP_SECURE === 'true',
  user: import.meta.env.SMTP_USER || '13891592@q.com',
  pass: import.meta.env.SMTP_PASS || '',
  from: import.meta.env.SMTP_FROM || '13891592@q.com'
}

// ==================== 创建 Transporter ====================

let transporter = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: CONFIG.host,
      port: CONFIG.port,
      secure: CONFIG.secure,
      auth: {
        user: CONFIG.user,
        pass: CONFIG.pass
      },
      // 超时配置
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    })
  }
  return transporter
}

// ==================== 发送邮件 ====================

/**
 * 发送一封邮件
 * @param {Object} options
 * @param {string} options.to        — 收件人邮箱
 * @param {string} options.subject   — 邮件主题
 * @param {string} options.text      — 纯文本正文
 * @param {string} [options.html]    — HTML 正文（可选）
 * @param {string} [options.cc]      — 抄送（可选）
 * @param {string} [options.bcc]     — 密送（可选）
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendEmail({ to, subject, text, html, cc, bcc }) {
  if (!CONFIG.pass) {
    console.warn('[Email] SMTP_PASS not configured — email not sent')
    return { success: false, message: 'SMTP 未配置密码（环境变量 SMTP_PASS 未设置）' }
  }

  try {
    const transport = getTransporter()
    const info = await transport.sendMail({
      from: `"${CONFIG.from}" <${CONFIG.user}>`,
      to,
      subject,
      text,
      html: html || text,
      cc,
      bcc
    })
    console.log(`[Email] Sent: ${info.messageId} → ${to}`)
    return { success: true, message: info.messageId }
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message)
    return { success: false, message: err.message }
  }
}

/**
 * 发送审批通知邮件
 * @param {Object} options
 */
export async function sendApprovalEmail({ to, period, submitterName, amount, status, stepName, opinion }) {
  const subjects = {
    pending: `【待审批】${period} - 销售预测审批`,
    approved: `【已通过】${period} - 销售预测审批`,
    rejected: `【已退回】${period} - 销售预测退回通知`,
    final: `【完成】${period} - 销售预测已完成全部审批`
  }

  const subject = subjects[status] || `【通知】${period} - 销售预测`

  const text = `
销售预测审批通知
================

预测周期：${period}
提交人：${submitterName}
金额：¥${amount ? Number(amount).toLocaleString() : 'N/A'}
当前状态：${status === 'pending' ? '待您审批' : status === 'approved' ? `已通过（${stepName}）` : status === 'rejected' ? '已被退回' : '已完成全部审批'}
${opinion ? `审批意见：${opinion}` : ''}

请登录 Sandvik 销售预测系统查看详情。

---
此邮件由 Sandvik 销售预测系统自动发送
`.trim()

  return sendEmail({ to, subject, text })
}

/**
 * 测试邮件发送
 * @param {string} testEmail — 测试收件人邮箱
 */
export async function sendTestEmail(testEmail) {
  return sendEmail({
    to: testEmail,
    subject: '🔔 Sandvik 销售预测系统 — 邮件通知测试',
    text: `
您好！

这是一封来自 Sandvik 销售预测系统的测试邮件。

如果您收到此邮件，说明邮件通知功能已配置成功！

发送时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
发件邮箱：${CONFIG.user}

---
Sandvik China Division Sales Forecast Tool
    `.trim()
  })
}

// ==================== 导出配置（供外部读取） ====================
export { CONFIG }
export default { sendEmail, sendApprovalEmail, sendTestEmail, CONFIG }
