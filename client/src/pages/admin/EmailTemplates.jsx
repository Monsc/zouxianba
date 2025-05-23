import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Save, Trash2, Eye, Edit, Mail, Send, Copy } from 'lucide-react';

// 模拟数据
const templates = [
  {
    id: '1',
    name: '欢迎邮件',
    subject: '欢迎加入走线吧！',
    type: 'welcome',
    description: '新用户注册后发送的欢迎邮件',
    content: `亲爱的 {{username}}：

欢迎加入走线吧！

感谢您注册成为我们的会员。在这里，您可以：
- 分享您的想法和经验
- 与其他用户交流互动
- 发现有趣的内容和话题

如果您有任何问题，请随时联系我们。

祝您使用愉快！

走线吧团队`,
    variables: ['username'],
    status: 'active',
  },
  {
    id: '2',
    name: '重置密码',
    subject: '重置您的密码',
    type: 'reset_password',
    description: '用户请求重置密码时发送的邮件',
    content: `尊敬的 {{username}}：

我们收到了重置您密码的请求。请点击以下链接重置密码：

{{reset_link}}

此链接将在 24 小时后失效。

如果您没有请求重置密码，请忽略此邮件。

走线吧团队`,
    variables: ['username', 'reset_link'],
    status: 'active',
  },
  {
    id: '3',
    name: '邮箱验证',
    subject: '验证您的邮箱',
    type: 'verify_email',
    description: '用户注册后验证邮箱的邮件',
    content: `尊敬的 {{username}}：

感谢您注册走线吧！请点击以下链接验证您的邮箱：

{{verify_link}}

此链接将在 24 小时后失效。

走线吧团队`,
    variables: ['username', 'verify_link'],
    status: 'active',
  },
];

const templateTypes = [
  { value: 'welcome', label: '欢迎邮件' },
  { value: 'reset_password', label: '重置密码' },
  { value: 'verify_email', label: '邮箱验证' },
  { value: 'notification', label: '通知邮件' },
  { value: 'custom', label: '自定义模板' },
];

export default function EmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleCreate = () => {
    // 实现创建模板的逻辑
    console.log('创建模板');
  };

  const handleEdit = id => {
    setSelectedTemplate(id);
    setIsEditing(true);
  };

  const handlePreview = id => {
    setSelectedTemplate(id);
    setIsPreviewing(true);
  };

  const handleDelete = id => {
    // 实现删除模板的逻辑
    console.log('删除模板', id);
  };

  const handleSave = () => {
    // 实现保存模板的逻辑
    console.log('保存模板');
    setIsEditing(false);
  };

  const handleTest = () => {
    // 实现测试发送的逻辑
    console.log('测试发送');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">邮件模板</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            创建模板
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label>模板类型</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>搜索模板</Label>
                <Input placeholder="输入模板名称..." />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模板名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map(template => (
                    <TableRow key={template.id}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>
                        {templateTypes.find(t => t.value === template.type)?.label}
                      </TableCell>
                      <TableCell>{template.description}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            template.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {template.status === 'active' ? '启用' : '禁用'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreview(template.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(template.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      {/* 编辑/预览模态框 */}
      {selectedTemplate && (isEditing || isPreviewing) && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{isEditing ? '编辑模板' : '预览模板'}</h2>
              <div className="flex items-center space-x-2">
                {isEditing && (
                  <>
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                    <Button variant="outline" onClick={handleTest}>
                      <Send className="w-4 h-4 mr-2" />
                      测试发送
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setIsPreviewing(false);
                    setSelectedTemplate(null);
                  }}
                >
                  关闭
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>模板名称</Label>
                <Input
                  defaultValue={templates.find(t => t.id === selectedTemplate)?.name}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>邮件主题</Label>
                <Input
                  defaultValue={templates.find(t => t.id === selectedTemplate)?.subject}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>邮件内容</Label>
                <Textarea
                  defaultValue={templates.find(t => t.id === selectedTemplate)?.content}
                  disabled={!isEditing}
                  className="h-[400px]"
                />
              </div>
              <div>
                <Label>可用变量</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {templates
                    .find(t => t.id === selectedTemplate)
                    ?.variables.map(variable => (
                      <Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isEditing) {
                            // 实现插入变量的逻辑
                            console.log('插入变量', variable);
                          }
                        }}
                      >
                        {`{{${variable}}}`}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
