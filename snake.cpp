#include <iostream>
#include <conio.h>
#include <windows.h>
#include <cstdlib>
using namespace std;

const int width = 20;
const int height = 20;

int x, y, foodX, foodY, score;
int tailX[100], tailY[100];
int nTail;
enum Dir { STOP = 0, LEFT, RIGHT, UP, DOWN };
Dir dir;
bool gameOver;

void Setup()
{
    gameOver = false;
    dir = RIGHT;
    x = width / 2;
    y = height / 2;
    foodX = rand() % width;
    foodY = rand() % height;
    score = 0;
}

void Draw()
{
    system("cls");
    // 上边框
    for (int i = 0; i < width + 2; i++) cout << "#";
    cout << endl;

    for (int i = 0; i < height; i++)
    {
        for (int j = 0; j < width; j++)
        {
            if (j == 0) cout << "#";
            if (i == y && j == x)
                cout << "O"; //蛇头
            else if (i == foodY && j == foodX)
                cout << "F"; //食物
            else
            {
                bool print = false;
                for (int k = 0; k < nTail; k++)
                {
                    if (tailX[k] == j && tailY[k] == i)
                    {
                        cout << "o";
                        print = true;
                    }
                }
                if (!print) cout << " ";
            }
            if (j == width - 1) cout << "#";
        }
        cout << endl;
    }

    // 下边框
    for (int i = 0; i < width + 2; i++) cout << "#";
    cout << endl;
    cout << "当前分数: " << score << endl;
}

void Input()
{
    if (_kbhit())
    {
        switch (_getch())
        {
            case 'a': dir = LEFT; break;
            case 'd': dir = RIGHT; break;
            case 'w': dir = UP; break;
            case 's': dir = DOWN; break;
            case 'x': gameOver = true; break;
        }
    }
}

void Logic()
{
    // 移动身体
    int prevX = tailX[0];
    int prevY = tailY[0];
    int prev2X, prev2Y;
    tailX[0] = x;
    tailY[0] = y;
    for (int i = 1; i < nTail; i++)
    {
        prev2X = tailX[i];
        prev2Y = tailY[i];
        tailX[i] = prevX;
        tailY[i] = prevY;
        prevX = prev2X;
        prevY = prev2Y;
    }

    //移动蛇头
    switch (dir)
    {
        case LEFT: x--; break;
        case RIGHT: x++; break;
        case UP: y--; break;
        case DOWN: y++; break;
        default: break;
    }

    //撞墙
    if (x < 0 || x >= width || y < 0 || y >= height) gameOver = true;
    //撞自己
    for (int i = 0; i < nTail; i++)
        if (tailX[i] == x && tailY[i] == y) gameOver = true;

    //吃到食物：加分+加长蛇身
    if (x == foodX && y == foodY)
    {
        score += 10;
        foodX = rand() % width;
        foodY = rand() % height;
        nTail++;
    }
}

int main()
{
    Setup();
    while (!gameOver)
    {
        Draw();
        Input();
        Logic();
        // 根据分数动态调整延迟，分数越高速度越快
        int sleepTime = max(20, 80 - score / 2);
        Sleep(sleepTime);
    }
    //游戏结束输出最终得分
    cout << "====游戏结束====" << endl;
    cout << "最终得分：" << score << endl;
    system("pause");
    return 0;
}
