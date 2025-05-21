const VoiceChatRoom = require('../models/VoiceChatRoom');
const { uploadToCloudflare } = require('../utils/cloudflare');
const { getIO } = require('../socket');

class VoiceChatController {
  // 创建语音聊天房间
  async createRoom(req, res) {
    try {
      const { title, description, settings } = req.body;
      const room = new VoiceChatRoom({
        title,
        description,
        host: req.user._id,
        settings: {
          ...settings,
          isPrivate: settings?.isPrivate || false
        }
      });

      await room.addParticipant(req.user._id, 'host');
      await room.save();

      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 获取语音聊天房间列表
  async getRooms(req, res) {
    try {
      const { status = 'active', page = 1, limit = 10 } = req.query;
      const query = { status };

      const rooms = await VoiceChatRoom.find(query)
        .populate('host', 'username avatar')
        .populate('participants.user', 'username avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await VoiceChatRoom.countDocuments(query);

      res.json({
        rooms,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 获取单个语音聊天房间
  async getRoom(req, res) {
    try {
      const room = await VoiceChatRoom.findById(req.params.id)
        .populate('host', 'username avatar')
        .populate('participants.user', 'username avatar');

      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      res.json(room);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 加入语音聊天房间
  async joinRoom(req, res) {
    try {
      const room = await VoiceChatRoom.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      if (room.status !== 'active') {
        return res.status(400).json({ message: 'Room is not active' });
      }

      await room.addParticipant(req.user._id);
      const io = getIO();
      io.to(room._id.toString()).emit('participantJoined', {
        user: req.user,
        role: 'listener'
      });

      res.json(room);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 离开语音聊天房间
  async leaveRoom(req, res) {
    try {
      const room = await VoiceChatRoom.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      await room.removeParticipant(req.user._id);
      const io = getIO();
      io.to(room._id.toString()).emit('participantLeft', {
        userId: req.user._id
      });

      res.json({ message: 'Left room successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 更新房间设置
  async updateRoomSettings(req, res) {
    try {
      const room = await VoiceChatRoom.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      if (room.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only host can update settings' });
      }

      const { settings } = req.body;
      room.settings = {
        ...room.settings,
        ...settings
      };

      await room.save();
      const io = getIO();
      io.to(room._id.toString()).emit('roomSettingsUpdated', room.settings);

      res.json(room);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 开始录制
  async startRecording(req, res) {
    try {
      const room = await VoiceChatRoom.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      if (room.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only host can start recording' });
      }

      await room.startRecording();
      const io = getIO();
      io.to(room._id.toString()).emit('recordingStarted');

      res.json({ message: 'Recording started' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 停止录制
  async stopRecording(req, res) {
    try {
      const room = await VoiceChatRoom.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      if (room.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only host can stop recording' });
      }

      const { recordingUrl, duration } = req.body;
      await room.stopRecording(recordingUrl, duration);
      const io = getIO();
      io.to(room._id.toString()).emit('recordingStopped', {
        url: recordingUrl,
        duration
      });

      res.json({ message: 'Recording stopped' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 结束房间
  async endRoom(req, res) {
    try {
      const room = await VoiceChatRoom.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      if (room.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only host can end room' });
      }

      await room.endRoom();
      const io = getIO();
      io.to(room._id.toString()).emit('roomEnded');

      res.json({ message: 'Room ended successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 上传录音文件
  async uploadRecording(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const file = req.file;
      const url = await uploadToCloudflare(file.buffer, file.originalname, 'audio');

      res.json({ url });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new VoiceChatController(); 