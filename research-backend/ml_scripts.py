from PIL import Image
import torch
from torchvision import transforms
from torch import nn

class ConvLayer(nn.Module):
    def __init__(self, inputChannels, outputChannels):
        super().__init__()
        self.ConvLayer = nn.Sequential(
            nn.Conv2d(in_channels=inputChannels, out_channels=outputChannels, kernel_size=3, padding=1, stride=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, padding=1, stride=1)
        )

    def forward(self, x: torch.Tensor):
        return self.ConvLayer(x)



class Model(nn.Module):
    
    
    def __init__(self, in_channels: int, hidden_channels: int, hidden_layers:int, out_channels: int, height: int, width: int):
        super().__init__()

        self.input = nn.Conv2d(in_channels=in_channels, out_channels=hidden_channels, kernel_size=3, padding=1, stride=1)
        self.conv_layers = nn.ModuleList()
        self.output = nn.Sequential(
            nn.Flatten(),
            nn.LazyLinear(out_features=out_channels),
            nn.Sigmoid()
        )

        for i in range(hidden_layers):
            self.conv_layers.append(ConvLayer(inputChannels=hidden_channels, outputChannels=hidden_channels))



    def forward(self, X: torch.Tensor):
        X = self.input(X)

        for layer in self.conv_layers:
            X = layer(X)

        return self.output(X)


def get_inference(img: Image): #Needs to be a PIL.Image Object

    model=Model(in_channels=3, hidden_channels=10, hidden_layers=3, out_channels=2, height=480, width=640)

    if torch.cuda.is_available():
        model.load_state_dict(torch.load("ML/First Trial", map_location=torch.device('cuda')))

    else:
        model.load_state_dict(torch.load("ML/First Trial", map_location=torch.device('cpu')))
    
    tran = transforms.Compose([transforms.Resize((480, 640)), transforms.ToTensor()])

    img = tran(img)
    img = torch.unsqueeze(img, dim=0)
    preds = model(img)

    preds = torch.nn.functional.softmax(preds, dim = 1)#logits to preds
    labels = torch.argmax(preds, dim=1).item()

    if labels == 0:
        return "Clean"
    elif labels==1:
        return "Dirty"
    else:
        return "Empty"


    